import { expect, it } from 'vitest';
import { FaithfulHttpClientDouble } from '../testing/faithful-http-client.double';
import { loadMobileRuntime } from '../testing/runtime-module';

interface AdapterOperation {
  readonly modulePath: string;
  readonly exportName: string;
  readonly method: string;
  readonly verb: 'GET' | 'POST';
  readonly path: string;
  readonly args: readonly unknown[];
  readonly command?: boolean;
}

const OPERATIONS: readonly AdapterOperation[] = [
  {
    modulePath: 'data/api/mobile-bootstrap.client',
    exportName: 'MobileBootstrapClient',
    method: 'getBootstrap',
    verb: 'GET',
    path: '/v1/ops/mobile-bootstrap',
    args: [{}],
  },
  {
    modulePath: 'data/api/mobile-bootstrap.client',
    exportName: 'MobileBootstrapClient',
    method: 'openShift',
    verb: 'POST',
    path: '/v1/ops/mobile-bootstrap/shifts',
    args: [{}, 'device-001'],
    command: true,
  },
  {
    modulePath: 'data/api/mobile-bootstrap.client',
    exportName: 'MobileBootstrapClient',
    method: 'closeShift',
    verb: 'POST',
    path: '/v1/ops/mobile-bootstrap/shifts/shift-001/close',
    args: ['shift-001', {}],
    command: true,
  },
  {
    modulePath: 'data/api/mobile-bootstrap.client',
    exportName: 'MobileBootstrapClient',
    method: 'handoffSession',
    verb: 'POST',
    path: '/v1/ops/mobile-bootstrap/sessions/handoff',
    args: [{}],
    command: true,
  },
  {
    modulePath: 'data/api/ops-snapshots.client',
    exportName: 'OpsSnapshotsClient',
    method: 'externalQuery',
    verb: 'POST',
    path: '/v1/ops/snapshots/external-queries',
    args: [{}],
  },
  {
    modulePath: 'data/api/offline-sync.client',
    exportName: 'OfflineSyncClient',
    method: 'submitBatch',
    verb: 'POST',
    path: '/v1/ops/offline-sync/sync-batches',
    args: [{}],
  },
  {
    modulePath: 'data/api/offline-sync.client',
    exportName: 'OfflineSyncClient',
    method: 'receiptByIdempotency',
    verb: 'GET',
    path: '/v1/ops/offline-sync/receipts/tenant-001/by-idempotency/key-001',
    args: ['tenant-001', 'key-001'],
  },
  {
    modulePath: 'data/api/offline-sync.client',
    exportName: 'OfflineSyncClient',
    method: 'resolveConflict',
    verb: 'POST',
    path: '/v1/ops/offline-sync/sync-conflicts/conflict-001/resolve',
    args: ['conflict-001', {}],
  },
  ...(
    [
      'finalize',
      'recordScience',
      'recordPrintEvent',
      'queueTransmission',
    ] as const
  ).map((method) => ({
    modulePath: 'data/api/ait.client',
    exportName: 'AitClient',
    method,
    verb: 'POST' as const,
    path: `/v1/inf/ait/aits/ait-001/${method === 'recordScience' ? 'science' : method === 'recordPrintEvent' ? 'print-events' : method === 'queueTransmission' ? 'queue-transmission' : 'finalize'}`,
    args: ['ait-001', {}],
    command: true,
  })),
  {
    modulePath: 'data/api/ait.client',
    exportName: 'AitClient',
    method: 'requestCancel',
    verb: 'POST',
    path: '/v1/inf/ait/cancel-requests',
    args: [{}],
    command: true,
  },
  {
    modulePath: 'data/api/measures.client',
    exportName: 'MeasuresClient',
    method: 'startAdministrativeMeasure',
    verb: 'POST',
    path: '/v1/inf/measures/administrative-measures/measure-001/start',
    args: ['measure-001', {}],
    command: true,
  },
  {
    modulePath: 'data/api/alcohol.client',
    exportName: 'AlcoholClient',
    method: 'startProcedure',
    verb: 'POST',
    path: '/v1/inf/alcohol/procedures/procedure-001/start',
    args: ['procedure-001', {}],
    command: true,
  },
  {
    modulePath: 'data/api/normative.client',
    exportName: 'NormativeClient',
    method: 'syncMetadata',
    verb: 'GET',
    path: '/v1/inf/normative/mobile-packages/sync-metadata',
    args: [],
  },
  {
    modulePath: 'data/api/normative.client',
    exportName: 'NormativeClient',
    method: 'packageContent',
    verb: 'GET',
    path: '/v1/inf/normative/mobile-packages/pkg-001/content',
    args: ['pkg-001'],
  },
  {
    modulePath: 'data/api/normative.client',
    exportName: 'NormativeClient',
    method: 'validatePackage',
    verb: 'POST',
    path: '/v1/inf/normative/mobile-packages/pkg-001/validate',
    args: ['pkg-001', {}],
    command: true,
  },
  {
    modulePath: 'data/api/provisioning.client',
    exportName: 'ProvisioningClient',
    method: 'createKeyChallenge',
    verb: 'POST',
    path: '/v1/ops/provisioning/devices/device-001/key-challenges',
    args: ['device-001'],
    command: true,
  },
  {
    modulePath: 'data/api/provisioning.client',
    exportName: 'ProvisioningClient',
    method: 'registerDeviceKey',
    verb: 'POST',
    path: '/v1/ops/provisioning/devices/device-001/keys',
    args: ['device-001', {}],
    command: true,
  },
  {
    modulePath: 'data/api/provisioning.client',
    exportName: 'ProvisioningClient',
    method: 'issuePackage',
    verb: 'POST',
    path: '/v1/ops/provisioning/packages',
    args: [{}],
    command: true,
  },
  {
    modulePath: 'data/api/provisioning.client',
    exportName: 'ProvisioningClient',
    method: 'downloadPackageContent',
    verb: 'GET',
    path: '/v1/ops/provisioning/packages/pkg-001/content',
    args: ['pkg-001'],
  },
  {
    modulePath: 'data/api/provisioning.client',
    exportName: 'ProvisioningClient',
    method: 'recordReceipt',
    verb: 'POST',
    path: '/v1/ops/provisioning/packages/pkg-001/receipts',
    args: ['pkg-001', {}],
    command: true,
  },
  {
    modulePath: 'data/api/provisioning.client',
    exportName: 'ProvisioningClient',
    method: 'readiness',
    verb: 'GET',
    path: '/v1/ops/provisioning/devices/device-001/readiness',
    args: ['device-001'],
  },
  {
    modulePath: 'data/api/provisioning.client',
    exportName: 'ProvisioningClient',
    method: 'revokeGrant',
    verb: 'POST',
    path: '/v1/ops/provisioning/grants/grant-001/revoke',
    args: ['grant-001', {}],
    command: true,
  },
  {
    modulePath: 'data/api/provisioning.client',
    exportName: 'ProvisioningClient',
    method: 'reconcileGrant',
    verb: 'POST',
    path: '/v1/ops/provisioning/grants/grant-001/reconcile',
    args: ['grant-001', {}],
    command: true,
  },
];

for (const operation of OPERATIONS) {
  it(`dado ${operation.exportName}.${operation.method} quando invocado então usa ${operation.verb} ${operation.path} e propaga StynxError`, async () => {
    const runtime = await loadMobileRuntime(operation.modulePath);
    const Constructor = runtime[operation.exportName] as
      (new (http: unknown) => Record<string, unknown>) | undefined;
    expect(Constructor).toBeTypeOf('function');
    const http = new FaithfulHttpClientDouble();
    const instance = new (
      Constructor as new (http: unknown) => Record<string, unknown>
    )(http);
    const call = instance[operation.method] as
      ((...args: readonly unknown[]) => Promise<unknown>) | undefined;
    expect(
      call,
      `${operation.exportName}.${operation.method} ausente`,
    ).toBeTypeOf('function');
    await expect(call?.(...operation.args)).resolves.toEqual({ ok: true });
    expect(http.calls).toContainEqual(
      expect.objectContaining({ method: operation.verb, path: operation.path }),
    );
    if (operation.command) {
      expect(http.calls[0]?.options).toEqual(
        expect.objectContaining({ headers: expect.anything() }),
      );
    }
    const error = { status: 409, code: 'TEAT.VERSION_CONFLICT' };
    const failing = new FaithfulHttpClientDouble();
    failing.fail(error);
    const rejected = new (
      Constructor as new (http: unknown) => Record<string, unknown>
    )(failing)[operation.method] as (
      ...args: readonly unknown[]
    ) => Promise<unknown>;
    await expect(rejected(...operation.args)).rejects.toBe(error);
  });
}

for (const [modulePath, exportName] of [
  ['data/api/measures.client', 'MeasuresClient'],
  ['data/api/alcohol.client', 'AlcoholClient'],
] as const) {
  it(`dado ${exportName}.unsupported source_pending quando invocado então rejeita sem construir URL`, async () => {
    const runtime = await loadMobileRuntime(modulePath);
    const Constructor = runtime[exportName] as new (http: unknown) => {
      unsupported?: () => Promise<never>;
    };
    const http = new FaithfulHttpClientDouble();
    const unsupported = new Constructor(http).unsupported;
    expect(unsupported).toBeTypeOf('function');
    await expect(unsupported?.()).rejects.toBeDefined();
    expect(http.calls).toHaveLength(0);
  });
}
