import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, it, vi } from 'vitest';
import { EncryptedStoreFixture } from '../testing/encrypted-store.fixture';
import {
  fixtureBootstrapReady,
  fixtureGrantReady,
} from '../testing/guard-fixtures';
import {
  BootstrapStore,
  TEAT_MOBILE_STYNX_SESSION_PORT,
} from './core/bootstrap.store';
import { TeatI18n } from './core/i18n.service';
import {
  ReadinessGateService,
  TEAT_READINESS_WARNING_SINK,
} from './core/readiness-gate.service';
import { LocalActStore } from './data/local/local-act.store';
import { TEAT_MOBILE_ID } from './data/sync/sync.worker';
import { AitStartPageComponent } from './features/ait/pages/ait-start.page';
import { AitReviewPageComponent } from './features/ait/pages/ait-review.page';
import catalog from './i18n/teat.pt-BR.json';
import { TEAT_HOMOLOGATION_AIT } from './shared/homologation-ait.port';
import { MobilePageRuntime } from './shared/mobile-page.component';

const reservation = {
  id: 'reserve-001',
  rangeId: 'range-001',
  shiftId: 'shift-001',
  series: 'F',
  startNumber: 101,
  endNumber: 101,
  validUntil: '2999-01-01T00:00:00.000Z',
  status: 'reserved',
};
const installed = {
  reservationId: reservation.id,
  rangeId: reservation.rangeId,
  entityType: 'ait',
  series: reservation.series,
  startNumber: reservation.startNumber,
  endNumber: reservation.endNumber,
  nextNumber: reservation.startNumber,
  validUntil: reservation.validUntil,
  status: 'reserved',
  tenantId: 'tenant-001',
  agentId: 'agent-001',
  deviceId: 'device-001',
  shiftId: 'shift-001',
};

function renderStart(options: {
  authenticated: boolean;
  authority: boolean;
  homologationPort?: Readonly<{
    profile: 'homologation';
    start: ReturnType<typeof vi.fn>;
    review: ReturnType<typeof vi.fn>;
  }>;
}) {
  const ready = fixtureBootstrapReady().bootstrap;
  if (ready === undefined) throw new Error('bootstrap-fixture-missing');
  const bootstrap = { ...ready, numberingReservations: [reservation] };
  const provisioning = fixtureGrantReady().provisioning;
  const pin = vi.fn(async () => undefined);
  const putDraft = vi.fn(async () => undefined);
  const putQueueItem = vi.fn(async () => undefined);
  const currentSession = vi.fn(async () => ({
    tenantId: 'tenant-001',
    orgUnitId: 'unit-001',
    agentId: 'agent-001',
    deviceId: 'device-001',
    shiftId: 'shift-001',
    appVersion: '1.0.0',
    roles: ['field-agent'],
  }));
  TestBed.configureTestingModule({
    imports: [AitStartPageComponent],
    providers: [
      {
        provide: StynxSessionService,
        useValue: { active: () => options.authenticated },
      },
      {
        provide: TEAT_MOBILE_STYNX_SESSION_PORT,
        useValue: { currentSession },
      },
      {
        provide: BootstrapStore,
        useValue: {
          state: () =>
            options.authority
              ? { status: 'ready', bootstrap, provisioning }
              : { status: 'blocked', code: 'bootstrap-unavailable' },
          snapshot: () => (options.authority ? bootstrap : undefined),
          provisioningSnapshot: () =>
            options.authority ? provisioning : undefined,
        },
      },
      {
        provide: LocalActStore,
        useValue: {
          pending: async () => [],
          reservationAuthority: async () =>
            options.authority ? installed : undefined,
          pinAitNumberAndPutFirstDraft: pin,
          putDraft,
          putQueueItem,
        },
      },
      {
        provide: TEAT_MOBILE_ID,
        useValue: { uuid: vi.fn(() => 'ait-local-001') },
      },
      { provide: TEAT_READINESS_WARNING_SINK, useValue: { record: vi.fn() } },
      ...(options.homologationPort === undefined
        ? []
        : [
            {
              provide: TEAT_HOMOLOGATION_AIT,
              useValue: options.homologationPort,
            },
          ]),
      ReadinessGateService,
      MobilePageRuntime,
      {
        provide: TeatI18n,
        useValue: {
          initialize: async () => undefined,
          translate: (key: string) =>
            key === 'teat.shell.homologation'
              ? catalog['teat.shell.homologation']
              : key,
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(AitStartPageComponent);
  fixture.detectChanges();
  return { fixture, pin, putDraft, putQueueItem, currentSession };
}

async function activateStart(
  fixture: ReturnType<typeof renderStart>['fixture'],
) {
  const button = fixture.nativeElement.querySelector(
    'button',
  ) as HTMLButtonElement | null;
  expect(button, 'ait-start deve oferecer ação DOM explícita').not.toBeNull();
  button?.click();
  fixture.detectChanges();
  await fixture.whenStable();
  const main = fixture.nativeElement.querySelector('main') as HTMLElement;
  expect(main.getAttribute('data-state')).toBe('blocked');
}

describe('CTG-0004a — AIT first-draft page has a real fail-closed DOM action', () => {
  it('blocks without authenticated STYNX session and never pins or queues', async () => {
    const harness = renderStart({ authenticated: false, authority: true });
    await activateStart(harness.fixture);
    expect(harness.currentSession).not.toHaveBeenCalled();
    expect(harness.pin).not.toHaveBeenCalled();
    expect(harness.putDraft).not.toHaveBeenCalled();
    expect(harness.putQueueItem).not.toHaveBeenCalled();
  });

  it('blocks without current ready bootstrap/reservation authority and never pins or queues', async () => {
    const harness = renderStart({ authenticated: true, authority: false });
    await activateStart(harness.fixture);
    expect(harness.pin).not.toHaveBeenCalled();
    expect(harness.putDraft).not.toHaveBeenCalled();
    expect(harness.putQueueItem).not.toHaveBeenCalled();
  });

  it('does not fabricate location or a partial AIT when no location source exists', async () => {
    const harness = renderStart({ authenticated: true, authority: true });
    await activateStart(harness.fixture);
    expect(harness.pin).not.toHaveBeenCalled();
    expect(harness.putDraft).not.toHaveBeenCalled();
    expect(harness.putQueueItem).not.toHaveBeenCalled();
  });

  it('demonstrates a synthetic AIT only with an explicitly injected homologation port, never pinning or queueing an official act', async () => {
    const start = vi.fn(async () => ({
      kind: 'demonstrated' as const,
      localEntityId: 'demo-ait-001',
    }));
    const review = vi.fn();
    const harness = renderStart({
      authenticated: false,
      authority: false,
      homologationPort: { profile: 'homologation', start, review },
    });
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();
    const main = harness.fixture.nativeElement.querySelector(
      'main',
    ) as HTMLElement;
    expect(main.getAttribute('data-profile')).toBe('homologation');
    expect(main.textContent).toContain('HOMOLOGAÇÃO — SIMULAÇÃO');
    const button = main.querySelector('button') as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    expect(start).not.toHaveBeenCalled();
    button?.click();
    harness.fixture.detectChanges();
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();
    expect(start).toHaveBeenCalledTimes(1);
    expect(review).not.toHaveBeenCalled();
    expect(main.getAttribute('data-state')).toBe('demonstrated');
    expect(main.textContent).toContain('HOMOLOGAÇÃO — SIMULAÇÃO');
    expect(harness.currentSession).not.toHaveBeenCalled();
    expect(harness.pin).not.toHaveBeenCalled();
    expect(harness.putDraft).not.toHaveBeenCalled();
    expect(harness.putQueueItem).not.toHaveBeenCalled();
  });
});

async function renderReview(staleQueueAction: boolean) {
  const encrypted = new EncryptedStoreFixture();
  const store = new LocalActStore(encrypted);
  const oldLocalEntityId = 'ait-old-001';
  if (staleQueueAction) {
    await encrypted.put('queue', 'ait-old-queue', {
      queueItemId: 'ait-old-queue',
      entityType: 'ait',
      localEntityId: oldLocalEntityId,
      idempotencyKey: 'old-idempotency-001',
      payloadHash: 'sha256:old-ait',
      payloadJson: {
        validation_blockers: [],
        reserved_number: '101',
        explicit_action: 'finalize',
      },
      commandContext: {
        session: {
          tenantId: 'tenant-001',
          orgUnitId: 'unit-001',
          agentId: 'agent-001',
          deviceId: 'device-001',
          shiftId: 'shift-001',
          appVersion: '1.0.0',
          roles: ['field-agent'],
        },
        localEntityId: oldLocalEntityId,
        entityType: 'ait',
        version: 1,
        idempotencyKey: 'old-idempotency-001',
        payloadHash: 'sha256:old-ait',
        createdLocallyAt: '2026-09-22T12:00:00.000Z',
        normativePackageId: 'pkg-001',
        normativePackageVersion: '2026.09',
        reservationId: 'reserve-001',
        reservedNumber: 101,
        ifMatch: '"version-1"',
        location: {
          latitude: -3.1,
          longitude: -60,
          accuracyMeters: 10,
          capturedAt: '2026-09-22T12:00:00.000Z',
          source: 'gps',
        },
      },
    });
  }
  const queueBefore = await encrypted.list('queue');
  const pending = vi.spyOn(store, 'pending');
  const putDraft = vi.spyOn(store, 'putDraft');
  const putQueueItem = vi.spyOn(store, 'putQueueItem');
  TestBed.configureTestingModule({
    imports: [AitReviewPageComponent],
    providers: [
      { provide: LocalActStore, useValue: store },
      {
        provide: BootstrapStore,
        useValue: {
          state: () => ({ status: 'blocked' }),
          snapshot: () => undefined,
        },
      },
      { provide: TEAT_READINESS_WARNING_SINK, useValue: { record: vi.fn() } },
      ReadinessGateService,
      MobilePageRuntime,
      {
        provide: TeatI18n,
        useValue: {
          initialize: async () => undefined,
          translate: (key: string) => key,
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(AitReviewPageComponent);
  const submit = vi.spyOn(fixture.componentInstance.integration, 'submit');
  fixture.detectChanges();
  await fixture.whenStable();
  return {
    fixture,
    store,
    encrypted,
    queueBefore,
    oldLocalEntityId,
    pending,
    putDraft,
    putQueueItem,
    submit,
  };
}

describe('CTG-0004a — review requires an explicitly selected draft identity', () => {
  it('blocks with no selected localEntityId and never treats pending queue as the draft index', async () => {
    const harness = await renderReview(false);
    const main = harness.fixture.nativeElement.querySelector(
      'main',
    ) as HTMLElement;
    expect(main.getAttribute('data-state')).toBe('blocked');
    expect(harness.pending).not.toHaveBeenCalled();
    expect(harness.submit).not.toHaveBeenCalled();
  });

  it('ignores an old sync-eligible AIT queue item without selected localEntityId, even on DOM submit', async () => {
    const harness = await renderReview(true);
    const main = harness.fixture.nativeElement.querySelector(
      'main',
    ) as HTMLElement;
    expect(main.getAttribute('data-state')).toBe('blocked');
    const form = main.querySelector('form') as HTMLFormElement | null;
    form?.dispatchEvent(
      new SubmitEvent('submit', { bubbles: true, cancelable: true }),
    );
    harness.fixture.detectChanges();
    await harness.fixture.whenStable();
    expect(harness.pending).not.toHaveBeenCalled();
    expect(harness.submit).not.toHaveBeenCalled();
    expect(harness.putDraft).not.toHaveBeenCalled();
    expect(harness.putQueueItem).not.toHaveBeenCalled();
    expect(await harness.store.draft(harness.oldLocalEntityId)).toBeUndefined();
    expect(await harness.encrypted.list('queue')).toEqual(harness.queueBefore);
  });
});
