import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type {
  ApplicationConfig,
  EnvironmentProviders,
  Provider,
} from '@angular/core';
import { expect, it, vi } from 'vitest';
import { STYNX_I18N_OPTIONS, StynxI18nService } from '@stynx-nyx/angular-i18n';
import type {
  MobileEntityDraft,
  MobilePrinterPort,
  MobileSessionContext,
} from '@stynx-nyx/mobile-runtime';
import { EncryptedStoreFixture } from '../testing/encrypted-store.fixture';
import { loadMobileRuntime } from '../testing/runtime-module';
import { AitClient } from './data/api/ait.client';
import { AlcoholClient } from './data/api/alcohol.client';
import { MeasuresClient } from './data/api/measures.client';
import { MobileBootstrapClient } from './data/api/mobile-bootstrap.client';
import { NormativeClient } from './data/api/normative.client';
import { OfflineSyncClient } from './data/api/offline-sync.client';
import { OpsSnapshotsClient } from './data/api/ops-snapshots.client';
import { ProvisioningClient } from './data/api/provisioning.client';
import { LocalActStore } from './data/local/local-act.store';
import { SyncWorker } from './data/sync/sync.worker';
import { NormativePackageService } from './data/normative/normative-package.service';
import {
  PrinterDialog,
  TEAT_MOBILE_PRINTER,
} from './shared/mobile-printer.port';
import { TEAT_BODYCAM_STATE } from './core/bodycam-indicator.component';
import { TeatI18n } from './core/i18n.service';
import type { MobileCommandContext } from './shared/mobile-page.component';

const headers = { 'Idempotency-Key': 'idem-ctg4a-001' } as const;

async function productionRootProviders(): Promise<
  readonly (Provider | EnvironmentProviders)[]
> {
  let captured: ApplicationConfig | undefined;
  vi.doMock('@angular/platform-browser', async () => {
    const actual = await vi.importActual<object>('@angular/platform-browser');
    return {
      ...actual,
      bootstrapApplication: (
        _component: unknown,
        config: ApplicationConfig,
      ) => {
        captured = config;
        return Promise.resolve({});
      },
    };
  });
  const original = window.__DETRAN_RUNTIME_CONFIG__;
  window.__DETRAN_RUNTIME_CONFIG__ = {
    tenantId: 'tenant-root',
    oidcAuthority: 'https://issuer.example.test',
    clientId: 'client-root',
  };
  try {
    await import('../main');
    await Promise.resolve();
  } finally {
    window.__DETRAN_RUNTIME_CONFIG__ = original;
    vi.doUnmock('@angular/platform-browser');
  }
  expect(captured, 'main.ts deve executar bootstrapApplication').toBeDefined();
  return captured?.providers ?? [];
}

it('F003/F007/F008 grafo root de produção resolve stores, workers, serviços, impressora e bodycam', async () => {
  const providers = await productionRootProviders();
  TestBed.configureTestingModule({
    providers: [...providers, provideHttpClientTesting()],
  });
  for (const [label, token] of [
    ['LocalActStore', LocalActStore],
    ['SyncWorker', SyncWorker],
    ['NormativePackageService', NormativePackageService],
    ['PrinterDialog', PrinterDialog],
    ['TEAT_MOBILE_PRINTER', TEAT_MOBILE_PRINTER],
    ['TEAT_BODYCAM_STATE', TEAT_BODYCAM_STATE],
  ] as const) {
    let resolved: unknown;
    try {
      resolved = TestBed.inject(token as never);
    } catch {
      resolved = undefined;
    }
    expect.soft(resolved !== undefined, `provider root ${label}`).toBe(true);
  }
});

it('F003 NormativePackageService usa a assinatura real, o manifesto assinado e Idempotency-Key no validate', async () => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  const http = TestBed.inject(HttpTestingController);
  const runtime = await loadMobileRuntime(
    'data/normative/normative-package.service',
  );
  const Service = runtime['NormativePackageService'] as new (
    ...args: readonly unknown[]
  ) => {
    install(
      id: string,
      input: { packageVersion: string; headers: typeof headers },
    ): Promise<unknown>;
  };
  const manifest = {
    package_version: '2026.09',
    valid_until: '2999-01-01T00:00:00Z',
    rules: ['RN-TEAT-139'],
  };
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(manifest)),
  );
  const manifestHash = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  const bootstrap = {
    snapshot: () => ({
      normativePackage: {
        id: 'pkg-001',
        version: '2026.09',
        manifestHash,
        validUntil: '2999-01-01T00:00:00Z',
      },
    }),
  };
  const service = new Service(
    new EncryptedStoreFixture(),
    new NormativeClient(
      TestBed.inject((await import('@angular/common/http')).HttpClient),
    ),
    bootstrap,
  );
  const installed = service
    .install('pkg-001', { packageVersion: '2026.09', headers })
    .then(
      (value) => ({ ok: true as const, value }),
      (error: unknown) => ({ ok: false as const, error }),
    );
  http.expectOne('/v1/inf/normative/mobile-packages/pkg-001/content').flush({
    manifest,
    manifest_hash: manifestHash,
    signature: 'base64:signature',
  });
  const validate = http.expectOne(
    '/v1/inf/normative/mobile-packages/pkg-001/validate',
  );
  expect(validate.request.body).toEqual({
    package_version: '2026.09',
    manifest_hash: manifestHash,
  });
  expect(validate.request.headers.get('Idempotency-Key')).toBe(
    headers['Idempotency-Key'],
  );
  validate.flush({ valid: true, reason: 'VALIDADO_PKG' });
  await expect(installed).resolves.toMatchObject({
    ok: true,
    value: { id: 'pkg-001', manifestHash },
  });
  http.verify();
});

it('F003/F007 impressora root falha fechado; PrinterDialog registra rejeição assíncrona e permite adapter fiel injetado', async () => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  const http = TestBed.inject(HttpTestingController);
  const runtime = await loadMobileRuntime('shared/mobile-printer.port');
  const printerToken = runtime['TEAT_MOBILE_PRINTER'];
  expect(printerToken, 'token do MobilePrinterPort de produção').toBeDefined();
  const rootPrinter = TestBed.inject(
    printerToken as never,
  ) as MobilePrinterPort;
  expect(rootPrinter.adapterName).not.toMatch(/fixture|inspector|simulated/i);
  const Dialog = runtime['PrinterDialog'] as new (
    ...args: readonly unknown[]
  ) => {
    print(input: Record<string, unknown>): Promise<unknown>;
  };
  const encrypted = new EncryptedStoreFixture();
  const store = new LocalActStore(encrypted);
  const ait = new AitClient(
    TestBed.inject((await import('@angular/common/http')).HttpClient),
  );
  const session: MobileSessionContext = {
    tenantId: 'tenant-001',
    orgUnitId: 'agency-001',
    agentId: 'agent-001',
    deviceId: 'device-001',
    shiftId: 'shift-001',
    appVersion: '1.0.0',
    roles: ['field-agent'],
  };
  const draft: MobileEntityDraft<'ait'> = {
    localId: 'draft-001',
    entityType: 'ait',
    tenantId: session.tenantId,
    orgUnitId: session.orgUnitId,
    agentId: session.agentId,
    deviceId: session.deviceId,
    shiftId: session.shiftId,
    status: 'finalized',
    reservedNumber: 1,
    reservationId: 'reservation-001',
    idempotencyKey: 'draft-idem-001',
    normativePackageId: 'pkg-001',
    normativePackageVersion: '2026.09',
    localContentHash: 'sha256:content',
    payload: {},
    location: {
      latitude: -15,
      longitude: -47,
      accuracyMeters: 3,
      capturedAt: '2026-09-22T00:00:00Z',
      source: 'gps',
    },
    evidence: [],
    createdAt: '2026-09-22T00:00:00Z',
    updatedAt: '2026-09-22T00:00:00Z',
  };
  const rootOutcome = await Promise.resolve()
    .then(() =>
      rootPrinter.printReceipt({
        session,
        draft,
        contentHash: 'sha256:content',
      }),
    )
    .then(
      (value) => ({ ok: true as const, value }),
      (error: unknown) => ({ ok: false as const, error }),
    );
  expect
    .soft(rootOutcome.ok, 'hardware source_pending não pode fabricar printed')
    .toBe(false);

  const rejectingPrinter: MobilePrinterPort = {
    adapterName: 'paired-printer-rejecting',
    printReceipt: async () => {
      throw new Error('printer-offline');
    },
  };
  const failure = new Dialog(rejectingPrinter, ait, store)
    .print({
      aitId: 'ait-001',
      aitVersion: '"version-7"',
      eventIdempotencyKey: headers['Idempotency-Key'],
      session,
      draft,
      contentHash: 'sha256:content',
    })
    .then(
      (value) => ({ ok: true as const, value }),
      (error: unknown) => ({ ok: false as const, error }),
    );
  await Promise.resolve();
  const failureRequest = http.expectOne(
    '/v1/inf/ait/aits/ait-001/print-events',
  );
  expect(failureRequest.request.body).toMatchObject({
    event_type: 'print-failed',
    failure_reason: expect.any(String),
  });
  expect(failureRequest.request.headers.get('Idempotency-Key')).toBe(
    headers['Idempotency-Key'],
  );
  expect(failureRequest.request.headers.get('If-Match')).toBe('"version-7"');
  failureRequest.flush({ id: 'print-event-failure' });
  await expect(failure).resolves.toMatchObject({
    ok: true,
    value: { eventType: 'print-failed' },
  });
  expect(await encrypted.list('print-receipt')).toHaveLength(0);

  const successfulPrinter: MobilePrinterPort = {
    adapterName: 'paired-printer-contract',
    printReceipt: async (input) => ({
      receiptId: 'receipt-001',
      localEntityId: input.draft.localId,
      reservedNumber: input.draft.reservedNumber,
      printerAdapter: 'paired-printer-contract',
      status: 'printed',
      printedAt: '2026-09-22T00:00:01Z',
      contentHash: input.contentHash,
    }),
  };
  const success = new Dialog(successfulPrinter, ait, store).print({
    aitId: 'ait-001',
    aitVersion: '"version-7"',
    eventIdempotencyKey: 'idem-ctg4a-002',
    session,
    draft,
    contentHash: 'sha256:content',
  });
  await Promise.resolve();
  const successRequest = http.expectOne(
    '/v1/inf/ait/aits/ait-001/print-events',
  );
  expect(successRequest.request.body).toMatchObject({ event_type: 'printed' });
  successRequest.flush({ id: 'print-event-success' });
  await expect(success).resolves.toMatchObject({ eventType: 'printed' });
  expect(await encrypted.list('print-receipt')).toHaveLength(1);
  http.verify();
});

it('F004/F009 MobilePageRuntime devolve objetos executáveis e prova ação real, não strings ou shells', async () => {
  const runtime = await loadMobileRuntime('shared/mobile-page.component');
  const encrypted = new EncryptedStoreFixture();
  const store = new LocalActStore(encrypted);
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: LocalActStore, useValue: store },
      ...[
        MobileBootstrapClient,
        OpsSnapshotsClient,
        OfflineSyncClient,
        AitClient,
        MeasuresClient,
        AlcoholClient,
        ProvisioningClient,
      ].map((Client) => ({
        provide: Client,
        useFactory: () => new Client(TestBed.inject(HttpClient)),
      })),
    ],
  });
  const Runtime = runtime['MobilePageRuntime'] as new (...args: never[]) => {
    load(contract: {
      screenId: string;
      sourceSheet: string;
    }): Record<string, unknown>;
  };
  const pageRuntime = TestBed.inject(Runtime);
  const contractFor = runtime['mobilePageContract'] as (screenId: string) => {
    screenId: string;
    sourceSheet: string;
  };
  const representatives = [
    ['auth-login', undefined, false],
    ['device-blocked', undefined, false],
    ['open-shift', MobileBootstrapClient, false],
    ['vehicle-search', OpsSnapshotsClient, false],
    ['vehicle-result', OpsSnapshotsClient, false],
    ['ait-start', undefined, true],
    ['ait-review', undefined, true],
    ['ait-done', undefined, true],
    ['ait-print', undefined, true],
    ['ait-cancel-request', AitClient, true],
    ['measure-start', MeasuresClient, false],
    ['removal', undefined, true],
    ['measure-done', undefined, true],
    ['alcohol-start', AlcoholClient, false],
    ['alcohol-device', undefined, true],
    ['sync', undefined, true],
    ['sync-conflict', OfflineSyncClient, false],
    ['diagnostics', undefined, true],
    ['support', undefined, false],
    ['approach-no-ait', undefined, true],
    ['context-help', undefined, false],
    ['local-settings', undefined, false],
  ] as const;
  for (const [screenId, Client, usesStore] of representatives) {
    const binding = pageRuntime.load(contractFor(screenId));
    expect
      .soft(
        usesStore ? binding['store'] === store : binding['store'] === undefined,
        `${screenId} ${usesStore ? 'usa LocalActStore injetado' : 'não inventa store'}`,
      )
      .toBe(true);
    if (Client === undefined) {
      expect
        .soft(binding['client'] === undefined, `${screenId} não inventa client`)
        .toBe(true);
    } else {
      expect
        .soft(
          binding['client'] === TestBed.inject(Client as never),
          `${screenId} usa client real`,
        )
        .toBe(true);
    }
    expect
      .soft(binding['load'], `${screenId}.load executável`)
      .toBeTypeOf('function');
  }
  const enabled = pageRuntime.load({
    screenId: 'ait-review',
    sourceSheet: 'IU-TEAT-ait-review.md',
  });
  expect(enabled['schema']).toBeTypeOf('object');
  expect(enabled['store']).toBeTypeOf('object');
  expect(enabled['load']).toBeTypeOf('function');
  expect(enabled['submit']).toBeTypeOf('function');
  const commandContext = {
    session: {
      tenantId: 'tenant-001',
      orgUnitId: 'agency-001',
      agentId: 'agent-001',
      deviceId: 'device-001',
      shiftId: 'shift-001',
      appVersion: '1.0.0',
      roles: ['field-agent'],
    },
    localEntityId: 'local-review-001',
    entityType: 'ait',
    version: 7,
    idempotencyKey: 'idem-review-001',
    payloadHash: 'sha256:review',
    createdLocallyAt: '2026-09-22T00:00:00Z',
    normativePackageId: 'pkg-001',
    normativePackageVersion: '2026.09',
    reservationId: 'reservation-001',
    reservedNumber: 101,
    ifMatch: '"version-7"',
    location: {
      latitude: -15.793889,
      longitude: -47.882778,
      accuracyMeters: 4,
      capturedAt: '2026-09-22T00:00:00Z',
      source: 'gps',
    },
  } as const;
  const reviewInput = {
    validation_blockers: [],
    reserved_number: 'AIT-001',
    explicit_action: 'finalize',
  };
  const action = await (
    enabled['submit'] as (
      input: unknown,
      context: typeof commandContext,
    ) => Promise<unknown>
  )(reviewInput, commandContext);
  expect(action).toMatchObject({ kind: 'persisted' });
  expect(await encrypted.list('draft')).toEqual([
    expect.objectContaining({
      localId: commandContext.localEntityId,
      entityType: commandContext.entityType,
      tenantId: commandContext.session.tenantId,
      idempotencyKey: commandContext.idempotencyKey,
      localContentHash: commandContext.payloadHash,
      normativePackageId: commandContext.normativePackageId,
      payload: expect.objectContaining(reviewInput),
      location: commandContext.location,
    }),
  ]);
  expect(await encrypted.list('queue')).toEqual([
    expect.objectContaining({
      localEntityId: commandContext.localEntityId,
      idempotencyKey: commandContext.idempotencyKey,
      payloadHash: commandContext.payloadHash,
      payloadJson: expect.objectContaining(reviewInput),
      location: commandContext.location,
    }),
  ]);

  const pageModule = await loadMobileRuntime(
    'features/ait/pages/ait-review.page',
  );
  const Page = pageModule['AitReviewPageComponent'] as new (
    ...args: never[]
  ) => Record<string, unknown>;
  const page = TestBed.runInInjectionContext(() => new Page());
  expect(page['load']).toBeTypeOf('function');
  expect(page['submit']).toBeTypeOf('function');
  await expect(
    (
      page['submit'] as (
        input: unknown,
        context: typeof commandContext,
      ) => Promise<unknown>
    )(reviewInput, commandContext),
  ).resolves.toMatchObject({ kind: 'persisted' });

  for (const screenId of ['support', 'messages', 'local-settings']) {
    const blocked = pageRuntime.load({
      screenId,
      sourceSheet: `IU-TEAT-${screenId}.md`,
    });
    expect(await (blocked['submit'] as () => Promise<unknown>)()).toEqual({
      kind: 'blocked',
      reason: 'source_pending',
    });
  }
  expect(
    (await encrypted.list('draft')).length +
      (await encrypted.list('queue')).length,
    'submit local precisa persistir no MobileEncryptedStorePort',
  ).toBeGreaterThan(0);
  TestBed.inject(HttpTestingController).verify();
});

it('F004 AIT Review carrega contexto real e submete exclusivamente pelo evento DOM', async () => {
  const runtime = await loadMobileRuntime('shared/mobile-page.component');
  const pageModule = await loadMobileRuntime(
    'features/ait/pages/ait-review.page',
  );
  const encrypted = new EncryptedStoreFixture();
  const store = new LocalActStore(encrypted);
  const input = {
    validation_blockers: [],
    reserved_number: 'AIT-002',
    explicit_action: 'finalize',
  };
  const context = {
    session: {
      tenantId: 'tenant-001',
      orgUnitId: 'agency-001',
      agentId: 'agent-001',
      deviceId: 'device-001',
      shiftId: 'shift-001',
      appVersion: '1.0.0',
      roles: ['field-agent'],
    },
    localEntityId: 'ui-review-001',
    entityType: 'ait',
    version: 1,
    idempotencyKey: 'ui-idem-001',
    payloadHash: 'sha256:ui-review',
    createdLocallyAt: '2026-09-22T00:00:00Z',
    normativePackageId: 'pkg-001',
    normativePackageVersion: '2026.09',
    reservationId: 'reservation-001',
    reservedNumber: 102,
    ifMatch: '"version-1"',
    location: {
      latitude: -15.793889,
      longitude: -47.882778,
      accuracyMeters: 4,
      capturedAt: '2026-09-22T00:00:00Z',
      source: 'gps',
    },
  } as const satisfies MobileCommandContext;
  TestBed.configureTestingModule({
    imports: [pageModule['AitReviewPageComponent'] as never],
    providers: [
      { provide: LocalActStore, useValue: store },
      runtime['MobilePageRuntime'],
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () =>
            (await import('./i18n/teat.pt-BR.json')).default,
        },
      },
      StynxI18nService,
      TeatI18n,
    ],
  });
  const Runtime = runtime['MobilePageRuntime'] as new (...args: never[]) => {
    load(contract: { screenId: string; sourceSheet: string }): {
      submit?(input: unknown, command: MobileCommandContext): Promise<unknown>;
    };
  };
  const producer = TestBed.inject(Runtime).load({
    screenId: 'ait-start',
    sourceSheet: 'IU-TEAT-ait-start.md',
  });
  await expect(producer.submit?.(input, context)).resolves.toMatchObject({
    kind: 'persisted',
    localEntityId: context.localEntityId,
  });
  const preexistingDraft = await store.draft(context.localEntityId);
  expect.soft(preexistingDraft).toMatchObject({
    localId: context.localEntityId,
    status: 'draft',
    payload: input,
  });
  const originalQueue =
    await encrypted.list<Readonly<Record<string, unknown>>>('queue');
  expect(originalQueue).toHaveLength(1);
  const fixture = TestBed.createComponent(
    pageModule['AitReviewPageComponent'] as never,
  );
  fixture.detectChanges();
  await fixture.whenStable();
  const form = fixture.nativeElement.querySelector(
    'form',
  ) as HTMLFormElement | null;
  expect(form).not.toBeNull();
  form?.dispatchEvent(
    new SubmitEvent('submit', { bubbles: true, cancelable: true }),
  );
  fixture.detectChanges();
  await fixture.whenStable();
  await vi.waitFor(async () =>
    expect(await store.draft(context.localEntityId)).toMatchObject({
      localId: context.localEntityId,
      status: 'finalized',
      payload: input,
      location: context.location,
    }),
  );
  const transitionedQueue =
    await encrypted.list<Readonly<Record<string, unknown>>>('queue');
  expect(transitionedQueue).toHaveLength(2);
  expect(transitionedQueue).toContainEqual(originalQueue[0]);
  expect(transitionedQueue).toContainEqual(
    expect.objectContaining({
      queueItemId: `${context.localEntityId}:v2`,
      localEntityId: context.localEntityId,
      payloadJson: input,
      location: context.location,
    }),
  );
  const main = fixture.nativeElement.querySelector('main') as HTMLElement;
  expect(main.getAttribute('data-state')).toBe('persisted');
  expect(
    (
      main.querySelector('[role="status"]') as HTMLElement | null
    )?.textContent?.trim(),
  ).toBe('Finalizado localmente');
});

it('F004 AIT Review publica blocked pelo evento DOM sem contexto carregado', async () => {
  const runtime = await loadMobileRuntime('shared/mobile-page.component');
  const pageModule = await loadMobileRuntime(
    'features/ait/pages/ait-review.page',
  );
  TestBed.configureTestingModule({
    imports: [pageModule['AitReviewPageComponent'] as never],
    providers: [
      {
        provide: LocalActStore,
        useValue: new LocalActStore(new EncryptedStoreFixture()),
      },
      runtime['MobilePageRuntime'],
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () =>
            (await import('./i18n/teat.pt-BR.json')).default,
        },
      },
      StynxI18nService,
      TeatI18n,
    ],
  });
  const fixture = TestBed.createComponent(
    pageModule['AitReviewPageComponent'] as never,
  );
  fixture.detectChanges();
  await fixture.whenStable();
  (
    fixture.nativeElement.querySelector('form') as HTMLFormElement
  ).dispatchEvent(
    new SubmitEvent('submit', { bubbles: true, cancelable: true }),
  );
  fixture.detectChanges();
  await fixture.whenStable();
  expect(
    (fixture.nativeElement.querySelector('main') as HTMLElement).getAttribute(
      'data-state',
    ),
  ).toBe('blocked');
});

it('F004 AIT Review publica error quando persistência real falha após submit DOM', async () => {
  const runtime = await loadMobileRuntime('shared/mobile-page.component');
  const pageModule = await loadMobileRuntime(
    'features/ait/pages/ait-review.page',
  );
  const encrypted = new EncryptedStoreFixture();
  const store = new LocalActStore(encrypted);
  const input = {
    validation_blockers: [],
    reserved_number: 'AIT-003',
    explicit_action: 'finalize',
  };
  const context = {
    session: {
      tenantId: 'tenant-001',
      orgUnitId: 'agency-001',
      agentId: 'agent-001',
      deviceId: 'device-001',
      shiftId: 'shift-001',
      appVersion: '1.0.0',
      roles: ['field-agent'],
    },
    localEntityId: 'ui-error',
    entityType: 'ait',
    version: 1,
    idempotencyKey: 'ui-error-idem',
    payloadHash: 'sha256:ui-error',
    createdLocallyAt: '2026-09-22T00:00:00Z',
    normativePackageId: 'pkg-001',
    normativePackageVersion: '2026.09',
    reservationId: 'reservation-001',
    reservedNumber: 103,
    ifMatch: '"version-1"',
    location: {
      latitude: -15.793889,
      longitude: -47.882778,
      accuracyMeters: 4,
      capturedAt: '2026-09-22T00:00:00Z',
      source: 'gps',
    },
  } as const satisfies MobileCommandContext;
  TestBed.configureTestingModule({
    imports: [pageModule['AitReviewPageComponent'] as never],
    providers: [
      { provide: LocalActStore, useValue: store },
      runtime['MobilePageRuntime'],
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () =>
            (await import('./i18n/teat.pt-BR.json')).default,
        },
      },
      StynxI18nService,
      TeatI18n,
    ],
  });
  const Runtime = runtime['MobilePageRuntime'] as new (...args: never[]) => {
    load(contract: { screenId: string; sourceSheet: string }): {
      submit?(input: unknown, command: MobileCommandContext): Promise<unknown>;
    };
  };
  const producer = TestBed.inject(Runtime).load({
    screenId: 'ait-start',
    sourceSheet: 'IU-TEAT-ait-start.md',
  });
  await expect(producer.submit?.(input, context)).resolves.toMatchObject({
    kind: 'persisted',
    localEntityId: context.localEntityId,
  });
  const fixture = TestBed.createComponent(
    pageModule['AitReviewPageComponent'] as never,
  );
  fixture.detectChanges();
  await fixture.whenStable();
  vi.spyOn(encrypted, 'put').mockRejectedValueOnce(
    new Error('indexeddb-write-failed'),
  );
  (
    fixture.nativeElement.querySelector('form') as HTMLFormElement
  ).dispatchEvent(
    new SubmitEvent('submit', { bubbles: true, cancelable: true }),
  );
  fixture.detectChanges();
  await fixture.whenStable();
  expect(
    (fixture.nativeElement.querySelector('main') as HTMLElement).getAttribute(
      'data-state',
    ),
  ).toBe('error');
});
