import { expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { EncryptedStoreFixture } from '../testing/encrypted-store.fixture';
import { LocalActStore } from './data/local/local-act.store';
import {
  MobilePageRuntime,
  type MobileCommandContext,
} from './shared/mobile-page.component';
import { AitClient } from './data/api/ait.client';
import { BootstrapStore } from './core/bootstrap.store';
import { NormativePackageService } from './data/normative/normative-package.service';
import type { MobileEntityDraft } from '@stynx-nyx/mobile-runtime';
import {
  AIT_FRAME_CASO_3,
  AIT_SIGNATURE_BRANCHES,
  ALCOHOL_REFUSAL_BRANCHES,
  FORM_CONTRACT_FIXTURES,
  SYNC_CONFLICT_ACTIONS,
} from '../testing/form-contract.fixture';
import { loadMobileRuntime } from '../testing/runtime-module';

interface ZodSchema {
  safeParse(input: unknown): { readonly success: boolean };
}

for (const expected of FORM_CONTRACT_FIXTURES) {
  it(`dado ${expected.modulePath} quando o payload canônico é validado então passa`, async () => {
    const runtime = await loadMobileRuntime(expected.modulePath);
    const schema = runtime[expected.exportName] as ZodSchema | undefined;
    expect(schema, `schema ausente: ${expected.exportName}`).toBeDefined();
    expect(schema?.safeParse(expected.validPayload).success).toBe(true);
  });

  for (const required of expected.required) {
    it(`dado ${expected.modulePath} sem ${required} quando validado então falha`, async () => {
      const runtime = await loadMobileRuntime(expected.modulePath);
      const schema = runtime[expected.exportName] as ZodSchema;
      const payload = { ...expected.validPayload };
      delete payload[required];
      expect(schema.safeParse(payload).success).toBe(false);
    });
  }
}

it('dado ait-review com bloqueante, número, pacote ou reserva inválidos quando finaliza então não persiste nem comanda', async () => {
  const encrypted = new EncryptedStoreFixture();
  const store = new LocalActStore(encrypted);
  const finalize = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      { provide: LocalActStore, useValue: store },
      {
        provide: BootstrapStore,
        useValue: {
          snapshot: () => ({
            snapshot: { validUntil: '2999-01-01T00:00:00Z' },
            context: {
              tenantId: 'tenant-001',
              device: { id: 'device-001' },
              agent: { id: 'agent-001' },
              activeShift: { id: 'shift-001', status: 'open' },
            },
            numberingReservations: [
              {
                id: 'reservation-001',
                rangeId: 'range-001',
                startNumber: 100,
                endNumber: 150,
                validUntil: '2999-01-01T00:00:00Z',
                status: 'reserved',
              },
            ],
            normativePackage: {
              id: 'pkg-001',
              version: '2026.09',
              manifestHash: 'sha256:installed',
              validUntil: '2999-01-01T00:00:00Z',
              status: 'published',
            },
          }),
        },
      },
      {
        provide: NormativePackageService,
        useValue: {
          usable: async () => ({
            id: 'pkg-001',
            version: '2026.09',
            manifestHash: 'sha256:installed',
            validUntil: '2999-01-01T00:00:00Z',
          }),
        },
      },
      { provide: AitClient, useValue: { finalize } },
    ],
  });
  const integration = TestBed.inject(MobilePageRuntime).load({
    screenId: 'ait-review',
    sourceSheet: 'IU-TEAT-ait-review.md',
  });
  const context: MobileCommandContext = {
    session: {
      tenantId: 'tenant-001',
      orgUnitId: 'agency-001',
      agentId: 'agent-001',
      deviceId: 'device-001',
      shiftId: 'shift-001',
      appVersion: '1.0.0',
      roles: ['field-agent'],
    },
    localEntityId: 'review-gate-001',
    entityType: 'ait',
    version: 1,
    idempotencyKey: 'review-gate-idem-001',
    payloadHash: 'sha256:review-gate',
    createdLocallyAt: '2026-09-22T00:00:00Z',
    normativePackageId: 'pkg-001',
    normativePackageVersion: '2026.09',
    reservationId: 'reservation-001',
    reservedNumber: 101,
    ifMatch: '"version-1"',
    location: {
      latitude: -15.793889,
      longitude: -47.882778,
      accuracyMeters: 4,
      capturedAt: '2026-09-22T00:00:00Z',
      source: 'gps',
    },
  };
  const validInput = FORM_CONTRACT_FIXTURES[7].validPayload;
  for (const [name, input, command] of [
    [
      'validation blocker',
      { ...validInput, validation_blockers: ['blocking'] },
      context,
    ],
    ['reserved number absent', { ...validInput, reserved_number: '' }, context],
    ['package absent', validInput, { ...context, normativePackageId: '' }],
    ['reservation absent', validInput, { ...context, reservationId: '' }],
  ] as const) {
    const result = await integration.submit?.(input, command);
    expect(result, name).toMatchObject({ kind: 'blocked' });
    expect(await encrypted.list('draft'), name).toEqual([]);
    expect(await encrypted.list('queue'), name).toEqual([]);
    expect(finalize, name).not.toHaveBeenCalled();
  }
});

for (const scenario of [
  'number outside active reservation',
  'expired reservation',
  'reservation expired now after old creation',
  'package identity mismatches installed package',
  'installed package hash mismatches bootstrap authority',
  'current aggregate has blocking validation',
  'current aggregate absent despite green payload',
  'malformed command context',
] as const) {
  it(`dado ait-review com ${scenario} quando finaliza então bloqueia sem escrita durável nem comando`, async () => {
    const encrypted = new EncryptedStoreFixture();
    const store = new LocalActStore(encrypted);
    let reservation = {
      id: 'reservation-001',
      rangeId: 'range-001',
      startNumber: 100,
      endNumber: 150,
      validUntil: '2999-01-01T00:00:00Z',
      status: 'reserved',
    };
    const bootstrap = {
      snapshot: () => ({
        snapshot: { validUntil: '2999-01-01T00:00:00Z' },
        context: {
          tenantId: 'tenant-001',
          device: { id: 'device-001' },
          agent: { id: 'agent-001' },
          activeShift: { id: 'shift-001', status: 'open' },
        },
        numberingReservations: [reservation],
        normativePackage: {
          id: 'pkg-001',
          version: '2026.09',
          manifestHash: 'sha256:installed',
          validUntil: '2999-01-01T00:00:00Z',
          status: 'published',
        },
      }),
    };
    let installed = {
      id: 'pkg-001',
      version: '2026.09',
      manifestHash: 'sha256:installed',
      validUntil: '2999-01-01T00:00:00Z',
      manifest: {},
      signature: {
        value: 'signed-manifest',
        signer: 'source_pending',
        kind: 'local-unsigned' as const,
      },
    };
    const usable = vi.fn().mockImplementation(async () => installed);
    const finalize = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: LocalActStore, useValue: store },
        { provide: BootstrapStore, useValue: bootstrap },
        { provide: NormativePackageService, useValue: { usable } },
        { provide: AitClient, useValue: { finalize } },
      ],
    });
    const integration = TestBed.inject(MobilePageRuntime).load({
      screenId: 'ait-review',
      sourceSheet: 'IU-TEAT-ait-review.md',
    });
    const context: MobileCommandContext = {
      session: {
        tenantId: 'tenant-001',
        orgUnitId: 'agency-001',
        agentId: 'agent-001',
        deviceId: 'device-001',
        shiftId: 'shift-001',
        appVersion: '1.0.0',
        roles: ['field-agent'],
      },
      localEntityId: `review-${scenario}`,
      entityType: 'ait',
      version: 1,
      idempotencyKey: `idem-${scenario}`,
      payloadHash: 'sha256:review',
      createdLocallyAt: '2026-09-22T00:00:00Z',
      normativePackageId: 'pkg-001',
      normativePackageVersion: '2026.09',
      reservationId: 'reservation-001',
      reservedNumber: 101,
      ifMatch: '"version-1"',
      location: {
        latitude: -15,
        longitude: -47,
        accuracyMeters: 3,
        capturedAt: '2026-09-22T00:00:00Z',
        source: 'gps',
      },
    };
    let command: MobileCommandContext = context;
    let input = {
      validation_blockers: [] as string[],
      reserved_number: '101',
      explicit_action: 'finalize',
    };
    if (scenario === 'number outside active reservation') {
      command = { ...context, reservedNumber: 200 };
      input = { ...input, reserved_number: '200' };
    } else if (scenario === 'expired reservation') {
      reservation = {
        ...reservation,
        validUntil: '2026-09-21T00:00:00Z',
        status: 'expired',
      };
    } else if (scenario === 'reservation expired now after old creation') {
      reservation = {
        ...reservation,
        validUntil: '2000-01-02T00:00:00Z',
      };
      command = { ...context, createdLocallyAt: '2000-01-01T00:00:00Z' };
    } else if (scenario === 'package identity mismatches installed package') {
      command = {
        ...context,
        normativePackageId: 'pkg-fake',
        normativePackageVersion: '2099.01',
      };
    } else if (
      scenario === 'installed package hash mismatches bootstrap authority'
    ) {
      installed = { ...installed, manifestHash: 'sha256:other' };
    } else if (scenario === 'current aggregate has blocking validation') {
      const draft: MobileEntityDraft<'ait'> = {
        localId: context.localEntityId,
        entityType: 'ait',
        tenantId: context.session.tenantId,
        orgUnitId: context.session.orgUnitId,
        agentId: context.session.agentId,
        deviceId: context.session.deviceId,
        shiftId: context.session.shiftId,
        status: 'draft',
        reservedNumber: context.reservedNumber,
        reservationId: context.reservationId,
        idempotencyKey: context.idempotencyKey,
        normativePackageId: context.normativePackageId,
        normativePackageVersion: context.normativePackageVersion,
        localContentHash: context.payloadHash,
        payload: { validation_blockers: ['missing-evidence'] },
        location: context.location,
        evidence: [],
        createdAt: context.createdLocallyAt,
        updatedAt: context.createdLocallyAt,
      };
      await encrypted.put('draft', draft.localId, draft);
    } else if (scenario === 'malformed command context') {
      command = {
        ...context,
        normativePackageId: undefined,
      } as unknown as MobileCommandContext;
    }
    const draftsBefore = await encrypted.list('draft');
    const queueBefore = await encrypted.list('queue');
    await expect(integration.submit?.(input, command)).resolves.toMatchObject({
      kind: 'blocked',
    });
    expect(await encrypted.list('draft')).toEqual(draftsBefore);
    expect(await encrypted.list('queue')).toEqual(queueBefore);
    expect(finalize).not.toHaveBeenCalled();
  });
}

it('dado ait-frame quando approach_class é caso_3 sem justificativa então bloqueia; fora dele não aceita justificativa', async () => {
  const runtime = await loadMobileRuntime('data/local/ait-frame.schema');
  const schema = runtime['aitFrameSchema'] as ZodSchema;
  expect(schema.safeParse(AIT_FRAME_CASO_3).success).toBe(true);
  expect(
    schema.safeParse({ ...AIT_FRAME_CASO_3, justificativa: undefined }).success,
  ).toBe(false);
  expect(
    schema.safeParse({
      ...FORM_CONTRACT_FIXTURES[3].validPayload,
      justificativa: 'indevida',
    }).success,
  ).toBe(false);
});

it('dado cada ramo de assinatura quando validado então aceita somente seu motivo próprio', async () => {
  const runtime = await loadMobileRuntime('data/local/ait-signature.schema');
  const schema = runtime['aitSignatureSchema'] as ZodSchema;
  for (const branch of AIT_SIGNATURE_BRANCHES) {
    expect(schema.safeParse(branch).success).toBe(true);
  }
  expect(schema.safeParse({ resultado: 'recusa' }).success).toBe(false);
});

it('dados recusa e impossibilidade de alcoolemia quando validadas então os ramos exclusivos passam', async () => {
  const runtime = await loadMobileRuntime('data/local/alcohol-refusal.schema');
  const schema = runtime['alcoholRefusalSchema'] as ZodSchema;
  for (const branch of ALCOHOL_REFUSAL_BRANCHES) {
    expect(schema.safeParse(branch).success).toBe(true);
  }
  expect(
    schema.safeParse({
      ...ALCOHOL_REFUSAL_BRANCHES[0],
      impossibilidade: true,
    }).success,
  ).toBe(false);
});

it('dado o par medido e considerado quando um dos valores falta então alcohol-result falha', async () => {
  const runtime = await loadMobileRuntime('data/local/alcohol-result.schema');
  const schema = runtime['alcoholResultSchema'] as ZodSchema;
  const payload = FORM_CONTRACT_FIXTURES[10].validPayload;
  expect(schema.safeParse(payload).success).toBe(true);
  expect(schema.safeParse({ ...payload, medido: undefined }).success).toBe(
    false,
  );
  expect(schema.safeParse({ ...payload, considerado: undefined }).success).toBe(
    false,
  );
});

it('dada cada ação canônica de sync-conflict quando validada então passa', async () => {
  const runtime = await loadMobileRuntime('data/local/sync-conflict.schema');
  const schema = runtime['syncConflictSchema'] as ZodSchema;
  for (const action of SYNC_CONFLICT_ACTIONS) {
    expect(
      schema.safeParse({ action, description: 'resolver conflito' }).success,
    ).toBe(true);
  }
});

for (const [modulePath, exportName, invalid] of [
  [
    'data/local/ait-vehicle.schema',
    'aitVehicleSchema',
    { ...FORM_CONTRACT_FIXTURES[1].validPayload, placa: 'ABC12' },
  ],
  [
    'data/local/ait-driver.schema',
    'aitDriverSchema',
    {
      ...FORM_CONTRACT_FIXTURES[2].validPayload,
      condutor: '11111111111',
      identified_by: 'cpf',
    },
  ],
  [
    'data/local/ait-driver.schema',
    'aitDriverSchema',
    {
      ...FORM_CONTRACT_FIXTURES[2].validPayload,
      condutor: '00000000000',
      identified_by: 'cnh',
    },
  ],
  [
    'data/local/ait-frame.schema',
    'aitFrameSchema',
    { ...FORM_CONTRACT_FIXTURES[3].validPayload, requires_equipment: true },
  ],
  [
    'data/local/ait-evidence.schema',
    'aitEvidenceSchema',
    { ...FORM_CONTRACT_FIXTURES[5].validPayload, hash: 'not-a-content-hash' },
  ],
  [
    'data/local/ait-evidence.schema',
    'aitEvidenceSchema',
    { ...FORM_CONTRACT_FIXTURES[5].validPayload, tipo: '__outside_catalog__' },
  ],
  [
    'data/local/alcohol-device.schema',
    'alcoholDeviceSchema',
    { ...FORM_CONTRACT_FIXTURES[9].validPayload, verification_valid: false },
  ],
  [
    'data/local/alcohol-result.schema',
    'alcoholResultSchema',
    {
      ...FORM_CONTRACT_FIXTURES[10].validPayload,
      medido: 0.35,
      considerado: 0.04,
    },
  ],
] as const) {
  it(`dado ${modulePath} com validação técnica inválida quando safeParse executa então fecha antes de qualquer client`, async () => {
    const runtime = await loadMobileRuntime(modulePath);
    const schema = runtime[exportName] as ZodSchema;
    expect(schema.safeParse(invalid).success).toBe(false);
  });
}
