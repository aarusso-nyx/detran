import { TestBed } from '@angular/core/testing';
import { Router, type Route } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { expect, it, vi } from 'vitest';
import {
  AuthBootstrapCoordinator,
  BootstrapStore,
  TEAT_GUARD_CONTEXT,
  TEAT_MOBILE_STYNX_SESSION_PORT,
  type BootstrapSnapshot,
} from './core/bootstrap.store';
import { TeatI18n } from './core/i18n.service';
import { MobileBootstrapClient } from './data/api/mobile-bootstrap.client';
import { ProvisioningClient } from './data/api/provisioning.client';
import { LocalActStore } from './data/local/local-act.store';
import { TEAT_MOBILE_ID } from './data/sync/sync.worker';
import { OpenShiftPageComponent } from './features/turno/pages/open-shift.page';
import {
  ReadinessGateService,
  TEAT_READINESS_WARNING_SINK,
} from './core/readiness-gate.service';
import { readinessGuard } from './navigation/guards/readiness.guard';
import { MobilePageRuntime } from './shared/mobile-page.component';
import { EncryptedStoreFixture } from '../testing/encrypted-store.fixture';

const preShiftBootstrap = {
  protocolVersion: 'teat-mobile-bootstrap.v1',
  requestedProtocolVersion: 'teat-mobile-bootstrap.v1',
  snapshot: {
    capturedAt: '2026-09-22T12:00:00.000Z',
    validUntil: '2999-01-01T00:00:00.000Z',
    maxAgeSeconds: 86400,
    authority: 'server-snapshot',
  },
  context: {
    tenantId: 'tenant-001',
    trafficAgencyId: 'agency-001',
    agent: { id: 'agent-001', operationalUnitId: 'unit-001', status: 'active' },
    device: {
      id: 'device-001',
      status: 'authorized',
      homologated: true,
      tamperDetected: false,
      appVersion: '1.0.0',
    },
    session: null,
    activeShift: null,
  },
  catalog: {
    operationalUnits: [{ id: 'unit-001', name: 'Unidade 001' }],
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
    publishedAt: '2026-09-22T12:00:00.000Z',
    validUntil: '2999-01-01T00:00:00.000Z',
  },
  numberingReservations: [],
  readiness: {
    blockers: ['NUMBERING_RESERVATION_REQUIRED'],
    preShiftReady: true,
    offlineReady: false,
  },
  capabilities: {
    canOpenShift: true,
    canOperateOffline: false,
    canReserveNumbering: false,
  },
};

// Backend pre-shift payload has no operational session or shift yet. The
// authenticated STYNX session is a separate authority supplied to refresh.
const backendNullPreShiftBootstrap = preShiftBootstrap;

function withoutPreShiftContextKeys(
  ...keys: readonly ('activeShift' | 'session')[]
) {
  const context: Record<string, unknown> = {
    ...backendNullPreShiftBootstrap.context,
  };
  for (const key of keys) delete context[key];
  return { ...backendNullPreShiftBootstrap, context };
}

const authenticatedSession = {
  tenantId: 'tenant-001',
  orgUnitId: 'unit-001',
  agentId: 'agent-001',
  deviceId: 'device-001',
  shiftId: '',
  appVersion: '1.0.0',
  roles: ['field-agent'],
};

const postShiftBootstrap = {
  ...preShiftBootstrap,
  context: {
    ...preShiftBootstrap.context,
    activeShift: { id: 'shift-001', status: 'open' },
    session: {
      id: 'shift-001',
      exclusive: true,
      startedAt: '2026-09-22T12:00:00.000Z',
    },
  },
  numberingReservations: [
    {
      id: 'reservation-001',
      rangeId: 'range-001',
      series: 'F',
      startNumber: 101,
      endNumber: 101,
      validUntil: '2999-01-01T00:00:00.000Z',
      status: 'reserved',
      shiftId: 'shift-001',
    },
  ],
  readiness: { blockers: [], preShiftReady: true, offlineReady: true },
  capabilities: {
    canOpenShift: false,
    canOperateOffline: true,
    canReserveNumbering: true,
  },
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((complete, fail) => {
    resolve = complete;
    reject = fail;
  });
  return { promise, resolve, reject };
}

async function renderOpenShift(options: {
  openShift: ReturnType<typeof vi.fn>;
  postBootstrap?: () => Promise<BootstrapSnapshot>;
}) {
  const getBootstrap = vi
    .fn()
    .mockResolvedValueOnce(backendNullPreShiftBootstrap as BootstrapSnapshot)
    .mockImplementation(
      options.postBootstrap ??
        (async () => postShiftBootstrap as BootstrapSnapshot),
    );
  const navigateByUrl = vi.fn(async () => true);
  const uuid = vi.fn(() => 'open-shift-idempotency-001');
  const localStore = new LocalActStore(new EncryptedStoreFixture());
  TestBed.configureTestingModule({
    imports: [OpenShiftPageComponent],
    providers: [
      { provide: Router, useValue: { navigateByUrl } },
      { provide: StynxSessionService, useValue: { active: () => true } },
      {
        provide: TEAT_MOBILE_STYNX_SESSION_PORT,
        useValue: { currentSession: async () => authenticatedSession },
      },
      BootstrapStore,
      AuthBootstrapCoordinator,
      {
        provide: MobileBootstrapClient,
        useValue: { getBootstrap, openShift: options.openShift },
      },
      {
        provide: ProvisioningClient,
        useValue: { readiness: async () => preShiftProvisioning },
      },
      { provide: LocalActStore, useValue: localStore },
      { provide: TEAT_MOBILE_ID, useValue: { uuid } },
      {
        provide: MobilePageRuntime,
        useValue: { load: () => ({ load: async () => ({ kind: 'loaded' }) }) },
      },
      { provide: TeatI18n, useValue: { translate: (key: string) => key } },
    ],
  });
  const bootstrapStore = TestBed.inject(BootstrapStore);
  await bootstrapStore.refresh(
    { device_id: 'device-001', app_version: '1.0.0' },
    authenticatedSession,
  );
  const refresh = vi.spyOn(bootstrapStore, 'refresh');
  const fixture = TestBed.createComponent(OpenShiftPageComponent);
  fixture.detectChanges();
  return {
    fixture,
    state: bootstrapStore.state,
    localStore,
    getBootstrap,
    refresh,
    navigateByUrl,
    uuid,
  };
}

function submitOpenShift(
  fixture: Awaited<ReturnType<typeof renderOpenShift>>['fixture'],
  operationalUnitId = 'unit-001',
) {
  const form = fixture.nativeElement.querySelector(
    'form',
  ) as HTMLFormElement | null;
  expect(
    form,
    'open-shift precisa expor ação por formulário real',
  ).not.toBeNull();
  const unit = form?.querySelector('[name="operational_unit_id"]') as
    HTMLInputElement | HTMLSelectElement | null;
  const startedAt = form?.querySelector(
    '[name="started_at"]',
  ) as HTMLInputElement | null;
  expect(unit, 'unidade operacional do catálogo é obrigatória').not.toBeNull();
  expect(startedAt, 'started_at é campo obrigatório do DTO').not.toBeNull();
  if (unit) {
    unit.value = operationalUnitId;
    unit.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (startedAt) {
    startedAt.value = '2026-09-22T12:05';
    startedAt.dispatchEvent(new Event('input', { bubbles: true }));
  }
  form?.dispatchEvent(
    new SubmitEvent('submit', { bubbles: true, cancelable: true }),
  );
}
const preShiftProvisioning = {
  ready: true,
  blockers: [],
  device_id: 'device-001',
  remaining_acts: 1,
  remaining_numbering_count: 0,
  evaluated_at: '2026-09-22T12:00:00.000Z',
};

it('WF-TEAT-002 bootstrap pré-turno com activeShift/session null publica ready autenticado sem reserva e libera apenas B', async () => {
  const getBootstrap = vi.fn(async () => backendNullPreShiftBootstrap);
  const localStore = new LocalActStore(new EncryptedStoreFixture());
  TestBed.configureTestingModule({
    providers: [
      BootstrapStore,
      { provide: MobileBootstrapClient, useValue: { getBootstrap } },
      {
        provide: ProvisioningClient,
        useValue: { readiness: async () => preShiftProvisioning },
      },
      { provide: LocalActStore, useValue: localStore },
      {
        provide: TEAT_GUARD_CONTEXT,
        useFactory: () => {
          const store = TestBed.inject(BootstrapStore);
          return {
            bootstrap: () => store.snapshot(),
            provisioning: () => store.provisioningSnapshot(),
          };
        },
      },
      { provide: TEAT_READINESS_WARNING_SINK, useValue: { record: vi.fn() } },
      ReadinessGateService,
    ],
  });
  const store = TestBed.inject(BootstrapStore);
  await expect(
    store.refresh(
      { device_id: 'device-001', app_version: '1.0.0' },
      authenticatedSession,
    ),
  ).resolves.toMatchObject({
    bootstrap: { context: { activeShift: null, session: null } },
  });
  expect(store.state().status).toBe('ready');
  expect(
    await localStore.reservationAuthority('reservation-001'),
  ).toBeUndefined();
  for (const path of ['shift-context', 'operation-select', 'open-shift']) {
    const decision = TestBed.runInInjectionContext(() =>
      readinessGuard(
        { path, data: { guardPlan: 'B' } } as Route,
        [],
        {} as Parameters<typeof readinessGuard>[2],
      ),
    );
    await expect(Promise.resolve(decision)).resolves.toBe(true);
  }
  const legalAct = TestBed.runInInjectionContext(() =>
    readinessGuard(
      { path: 'ait-start', data: { guardPlan: 'B+S' } } as Route,
      [],
      {} as Parameters<typeof readinessGuard>[2],
    ),
  );
  await expect(Promise.resolve(legalAct)).resolves.toBe(false);
});

it.each([
  [
    'capability canOpenShift ausente',
    {
      ...backendNullPreShiftBootstrap,
      capabilities: {
        ...backendNullPreShiftBootstrap.capabilities,
        canOpenShift: false,
      },
    },
  ],
  [
    'readiness preShiftReady ausente',
    {
      ...backendNullPreShiftBootstrap,
      readiness: {
        ...backendNullPreShiftBootstrap.readiness,
        preShiftReady: false,
      },
    },
  ],
  [
    'dispositivo bloqueado',
    {
      ...backendNullPreShiftBootstrap,
      context: {
        ...backendNullPreShiftBootstrap.context,
        device: {
          ...backendNullPreShiftBootstrap.context.device,
          status: 'blocked',
        },
      },
    },
  ],
])(
  'WF-TEAT-002 null pré-turno com %s nega rota B sem lançar',
  (_label, bootstrap) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TEAT_READINESS_WARNING_SINK, useValue: { record: vi.fn() } },
        ReadinessGateService,
      ],
    });
    const gate = TestBed.inject(ReadinessGateService);
    const decision = gate.evaluate({
      bootstrap: bootstrap as unknown as BootstrapSnapshot,
      provisioning: preShiftProvisioning,
      now: '2026-09-22T12:00:00.000Z',
      destination: 'open-shift',
      preShift: true,
    });
    expect(decision.allowed).toBe(false);
  },
);

it('WF-TEAT-002 payload null não promove ready sem sessão móvel autenticada válida', async () => {
  const getBootstrap = vi.fn(async () => backendNullPreShiftBootstrap);
  TestBed.configureTestingModule({
    providers: [
      BootstrapStore,
      { provide: MobileBootstrapClient, useValue: { getBootstrap } },
      {
        provide: ProvisioningClient,
        useValue: { readiness: async () => preShiftProvisioning },
      },
      {
        provide: LocalActStore,
        useValue: new LocalActStore(new EncryptedStoreFixture()),
      },
    ],
  });
  const store = TestBed.inject(BootstrapStore);
  await expect(
    store.refresh(
      { device_id: 'device-001', app_version: '1.0.0' },
      { ...authenticatedSession, tenantId: '' },
    ),
  ).rejects.toThrow('authenticated-mobile-session-required');
  expect(store.state().status).toBe('blocked');
  expect(getBootstrap).not.toHaveBeenCalled();
});

it.each([
  ['activeShift omitido', withoutPreShiftContextKeys('activeShift')],
  ['session omitida', withoutPreShiftContextKeys('session')],
  ['ambos omitidos', withoutPreShiftContextKeys('activeShift', 'session')],
  [
    'activeShift null com session operacional',
    {
      ...backendNullPreShiftBootstrap,
      context: {
        ...backendNullPreShiftBootstrap.context,
        session: postShiftBootstrap.context.session,
      },
    },
  ],
  [
    'activeShift operacional com session null',
    {
      ...backendNullPreShiftBootstrap,
      context: {
        ...backendNullPreShiftBootstrap.context,
        activeShift: { id: 'shift-001', status: 'open' },
      },
      numberingReservations: postShiftBootstrap.numberingReservations,
    },
  ],
])(
  'WF-TEAT-002 payload pré-turno %s falha fechado sem pin local',
  async (_label, bootstrap) => {
    const localStore = new LocalActStore(new EncryptedStoreFixture());
    TestBed.configureTestingModule({
      providers: [
        BootstrapStore,
        {
          provide: MobileBootstrapClient,
          useValue: { getBootstrap: async () => bootstrap },
        },
        {
          provide: ProvisioningClient,
          useValue: { readiness: async () => preShiftProvisioning },
        },
        { provide: LocalActStore, useValue: localStore },
      ],
    });
    const store = TestBed.inject(BootstrapStore);
    let rejection: unknown;
    try {
      await store.refresh(
        { device_id: 'device-001', app_version: '1.0.0' },
        authenticatedSession,
      );
    } catch (error) {
      rejection = error;
    }
    expect(
      rejection,
      'payload incompleto ou misto deve ser rejeitado',
    ).toBeInstanceOf(Error);
    expect(
      rejection,
      'rejeição deve ser controlada, não erro de deref',
    ).not.toBeInstanceOf(TypeError);
    expect(store.state().status).toBe('blocked');
    expect(
      await localStore.reservationAuthority('reservation-001'),
    ).toBeUndefined();
  },
);

it('WF-TEAT-002 allows only pre-shift B navigation past numbering/shift absence while B+S remains closed', async () => {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: TEAT_GUARD_CONTEXT,
        useValue: {
          bootstrap: () => preShiftBootstrap,
          provisioning: () => preShiftProvisioning,
        },
      },
      { provide: TEAT_READINESS_WARNING_SINK, useValue: { record: vi.fn() } },
      ReadinessGateService,
    ],
  });
  for (const path of ['shift-context', 'operation-select', 'open-shift']) {
    const result = TestBed.runInInjectionContext(() =>
      readinessGuard(
        { path, data: { guardPlan: 'B' } } as Route,
        [],
        {} as Parameters<typeof readinessGuard>[2],
      ),
    );
    await expect(Promise.resolve(result)).resolves.toBe(true);
  }
  const legalAct = TestBed.runInInjectionContext(() =>
    readinessGuard(
      { path: 'ait-start', data: { guardPlan: 'B+S' } } as Route,
      [],
      {} as Parameters<typeof readinessGuard>[2],
    ),
  );
  await expect(Promise.resolve(legalAct)).resolves.toBe(false);
});

it('WF-TEAT-002 pre-shift B exception never bypasses device, session, package or snapshot security', () => {
  TestBed.configureTestingModule({
    providers: [
      { provide: TEAT_READINESS_WARNING_SINK, useValue: { record: vi.fn() } },
      ReadinessGateService,
    ],
  });
  const gate = TestBed.inject(ReadinessGateService);
  const input = {
    bootstrap: preShiftBootstrap,
    provisioning: preShiftProvisioning,
    now: '2026-09-22T12:00:00.000Z',
    destination: 'open-shift',
    preShift: true,
  };
  expect(
    gate.evaluate({
      ...input,
      bootstrap: {
        ...preShiftBootstrap,
        context: {
          ...preShiftBootstrap.context,
          device: { ...preShiftBootstrap.context.device, status: 'blocked' },
        },
      },
    }).allowed,
  ).toBe(false);
  expect(
    gate.evaluate({
      ...input,
      bootstrap: {
        ...preShiftBootstrap,
        context: {
          ...preShiftBootstrap.context,
          session: {
            id: 'shift-001',
            exclusive: false,
            startedAt: '2026-09-22T12:00:00.000Z',
          },
        },
      },
    }).allowed,
  ).toBe(false);
  expect(
    gate.evaluate({
      ...input,
      bootstrap: {
        ...preShiftBootstrap,
        normativePackage: {
          ...preShiftBootstrap.normativePackage,
          manifestHash: '',
        },
      },
    }).allowed,
  ).toBe(false);
  expect(
    gate.evaluate({
      ...input,
      bootstrap: {
        ...preShiftBootstrap,
        snapshot: {
          ...preShiftBootstrap.snapshot,
          validUntil: '2000-01-01T00:00:00.000Z',
        },
      },
    }).allowed,
  ).toBe(false);
});

it('WF-TEAT-002 ação DOM envia OpenMobileShiftDto e CommandHeaders antes do refresh autenticado; só depois libera home', async () => {
  const refreshGate = deferred<void>();
  const openShift = vi.fn(async (...args: unknown[]) => {
    void args;
    return { id: 'shift-001', status: 'open' };
  });
  const harness = await renderOpenShift({
    openShift,
    postBootstrap: async () => {
      await refreshGate.promise;
      return postShiftBootstrap as BootstrapSnapshot;
    },
  });
  submitOpenShift(harness.fixture);
  await vi.waitFor(() => expect(openShift).toHaveBeenCalledOnce());
  expect(openShift).toHaveBeenCalledWith(
    expect.objectContaining({
      device_id: 'device-001',
      app_version: '1.0.0',
      operational_unit_id: 'unit-001',
      started_at: expect.any(String),
    }),
    'device-001',
    { 'Idempotency-Key': 'open-shift-idempotency-001' },
  );
  const dto = openShift.mock.calls[0]?.[0] as { started_at: string };
  expect(Number.isFinite(Date.parse(dto.started_at))).toBe(true);
  expect(harness.uuid).toHaveBeenCalledOnce();
  await vi.waitFor(() => expect(harness.refresh).toHaveBeenCalledOnce());
  expect(harness.refresh).toHaveBeenCalledWith(
    { device_id: 'device-001', app_version: '1.0.0' },
    authenticatedSession,
  );
  expect(harness.state().status).toBe('loading');
  expect(
    await harness.localStore.reservationAuthority('reservation-001'),
  ).toBeUndefined();
  expect(harness.navigateByUrl).not.toHaveBeenCalled();
  refreshGate.resolve();
  await vi.waitFor(() =>
    expect(harness.navigateByUrl).toHaveBeenCalledWith('/home'),
  );
  expect(harness.state()).toMatchObject({
    status: 'ready',
    bootstrap: {
      context: { activeShift: { id: 'shift-001', status: 'open' } },
      numberingReservations: [{ id: 'reservation-001', shiftId: 'shift-001' }],
    },
  });
  expect(
    await harness.localStore.reservationAuthority('reservation-001'),
  ).toMatchObject({
    reservationId: 'reservation-001',
    series: 'F',
    shiftId: 'shift-001',
    nextNumber: 101,
  });
});

it('WF-TEAT-002 retry após falha do comando preserva Idempotency-Key e não publica refresh antecipado', async () => {
  const openShift = vi
    .fn()
    .mockRejectedValueOnce(new Error('backend-unavailable'))
    .mockResolvedValueOnce({ id: 'shift-001', status: 'open' });
  const harness = await renderOpenShift({ openShift });
  submitOpenShift(harness.fixture);
  await vi.waitFor(() => expect(openShift).toHaveBeenCalledTimes(1));
  await harness.fixture.whenStable();
  expect(harness.refresh).not.toHaveBeenCalled();
  expect(harness.navigateByUrl).not.toHaveBeenCalled();
  expect(
    await harness.localStore.reservationAuthority('reservation-001'),
  ).toBeUndefined();
  expect(harness.state()).toMatchObject({
    bootstrap: {
      context: { activeShift: null },
      numberingReservations: [],
    },
  });
  submitOpenShift(harness.fixture);
  await vi.waitFor(() => expect(openShift).toHaveBeenCalledTimes(2));
  expect(openShift.mock.calls[0]?.[2]).toEqual({
    'Idempotency-Key': 'open-shift-idempotency-001',
  });
  expect(openShift.mock.calls[1]?.[2]).toEqual(openShift.mock.calls[0]?.[2]);
  expect(harness.uuid).toHaveBeenCalledOnce();
  await vi.waitFor(() => expect(harness.refresh).toHaveBeenCalledOnce());
});

it('WF-TEAT-002 falha no refresh autenticado não publica turno, reserva nem navega para B+S', async () => {
  const openShift = vi.fn(async () => ({ id: 'shift-001', status: 'open' }));
  const harness = await renderOpenShift({
    openShift,
    postBootstrap: async () => {
      throw new Error('bootstrap-refresh-failed');
    },
  });
  submitOpenShift(harness.fixture);
  await vi.waitFor(() => expect(harness.refresh).toHaveBeenCalledOnce());
  await harness.fixture.whenStable();
  expect(harness.state().status).toBe('blocked');
  expect(
    await harness.localStore.reservationAuthority('reservation-001'),
  ).toBeUndefined();
  expect(harness.navigateByUrl).not.toHaveBeenCalledWith('/home');
});

it('WF-TEAT-002 unidade fora do catálogo bloqueia POST, refresh e publicação local', async () => {
  const openShift = vi.fn(async () => ({ id: 'shift-001', status: 'open' }));
  const harness = await renderOpenShift({ openShift });
  submitOpenShift(harness.fixture, 'foreign-unit');
  await harness.fixture.whenStable();
  expect(openShift).not.toHaveBeenCalled();
  expect(harness.refresh).not.toHaveBeenCalled();
  expect(harness.navigateByUrl).not.toHaveBeenCalled();
  expect(
    await harness.localStore.reservationAuthority('reservation-001'),
  ).toBeUndefined();
  expect(harness.state()).toMatchObject({
    bootstrap: {
      context: { activeShift: null },
      numberingReservations: [],
    },
  });
});
