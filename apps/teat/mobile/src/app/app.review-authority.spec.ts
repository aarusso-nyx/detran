import { expect, it } from 'vitest';
import { fixtureBootstrapReady } from '../testing/guard-fixtures';
import { loadMobileRuntime } from '../testing/runtime-module';
import type { BootstrapSnapshot } from './core/bootstrap.store';
import type { InstalledNormativePackage } from './data/normative/normative-package.service';
import type { MobileCommandContext } from './shared/mobile-page.component';

type AuthorityInput = Readonly<{
  payload: Readonly<Record<string, unknown>>;
  context: MobileCommandContext;
  snapshot: BootstrapSnapshot | undefined;
  installed: InstalledNormativePackage | undefined;
  now: string;
}>;
type AuthorityResult =
  | Readonly<{ allowed: true }>
  | Readonly<{
      allowed: false;
      reason: 'context-invalid' | 'numbering-invalid' | 'package-invalid';
    }>;

async function authority(): Promise<
  (input: AuthorityInput) => AuthorityResult
> {
  const runtime = await loadMobileRuntime('shared/mobile-page.component');
  const evaluate = runtime['evaluateAitReviewAuthority'] as
    ((input: AuthorityInput) => AuthorityResult) | undefined;
  expect(evaluate).toBeTypeOf('function');
  return evaluate as (input: AuthorityInput) => AuthorityResult;
}

function validAuthority(): AuthorityInput {
  const bootstrap = fixtureBootstrapReady().bootstrap;
  if (bootstrap === undefined) throw new Error('bootstrap-fixture-missing');
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
    localEntityId: 'review-001',
    entityType: 'ait',
    version: 1,
    idempotencyKey: 'review-idem-001',
    payloadHash: 'sha256:review',
    createdLocallyAt: '2026-09-22T00:00:00Z',
    normativePackageId: 'pkg-001',
    normativePackageVersion: '1',
    reservationId: 'reserve-001',
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
  return {
    payload: {
      validation_blockers: [],
      reserved_number: '101',
      explicit_action: 'finalize',
    },
    context,
    snapshot: {
      ...bootstrap,
      normativePackage: {
        ...bootstrap.normativePackage,
        status: 'published',
      },
      numberingReservations: [
        {
          id: 'reserve-001',
          rangeId: 'range-001',
          startNumber: 100,
          endNumber: 150,
          validUntil: '2999-01-01T00:00:00Z',
          status: 'reserved',
        },
      ],
    },
    installed: {
      id: 'pkg-001',
      version: '1',
      manifestHash: bootstrap.normativePackage.manifestHash,
      validUntil: '2999-01-01T00:00:00Z',
      manifest: { package_version: '1' },
      signature: {
        value: 'signed-manifest',
        signer: 'source_pending',
        kind: 'local-unsigned',
      },
    },
    now: '2026-09-22T09:00:00Z',
  };
}

it('dada autoridade completa quando avaliada isoladamente então aprova sem finalizar AIT', async () => {
  expect((await authority())(validAuthority())).toEqual({ allowed: true });
});

it('dado número textual não canônico quando avaliado então bloqueia mesmo dentro da faixa', async () => {
  const input = validAuthority();
  expect(
    (await authority())({
      ...input,
      payload: { ...input.payload, reserved_number: 'AIT-0001' },
    }),
  ).toEqual({ allowed: false, reason: 'numbering-invalid' });
});

it('dado número fora da reserva ativa quando avaliado então bloqueia', async () => {
  const input = validAuthority();
  expect(
    (await authority())({
      ...input,
      context: { ...input.context, reservedNumber: 200 },
      payload: { ...input.payload, reserved_number: '200' },
    }),
  ).toEqual({ allowed: false, reason: 'numbering-invalid' });
});

it('dada reserva expirada no horário atual quando avaliada então bloqueia mesmo com criação anterior', async () => {
  const input = validAuthority();
  expect(
    (await authority())({
      ...input,
      context: {
        ...input.context,
        createdLocallyAt: '2026-09-20T00:00:00Z',
      },
      snapshot: {
        ...input.snapshot!,
        numberingReservations: [
          {
            id: 'reserve-001',
            rangeId: 'range-001',
            startNumber: 100,
            endNumber: 150,
            validUntil: '2026-09-21T00:00:00Z',
            status: 'reserved',
          },
        ],
      },
    }),
  ).toEqual({ allowed: false, reason: 'numbering-invalid' });
});

it('dado pacote falso com identificadores não vazios quando avaliado então bloqueia', async () => {
  const input = validAuthority();
  expect(
    (await authority())({
      ...input,
      context: {
        ...input.context,
        normativePackageId: 'pkg-fake',
        normativePackageVersion: '2099.01',
      },
    }),
  ).toEqual({ allowed: false, reason: 'package-invalid' });
});

it('dado hash instalado divergente do bootstrap quando avaliado então bloqueia', async () => {
  const input = validAuthority();
  expect(
    (await authority())({
      ...input,
      installed: { ...input.installed!, manifestHash: 'sha256:other' },
    }),
  ).toEqual({ allowed: false, reason: 'package-invalid' });
});

it('dado pacote expirado com identidade e hash válidos quando avaliado então preserva E.29 como aviso', async () => {
  const input = validAuthority();
  expect(
    (await authority())({
      ...input,
      installed: {
        ...input.installed!,
        validUntil: '2026-09-21T00:00:00Z',
      },
    }),
  ).toEqual({ allowed: true });
});

it('dado contexto incompleto quando avaliado então retorna context-invalid sem lançar', async () => {
  const input = validAuthority();
  expect(
    (await authority())({
      ...input,
      context: {
        ...input.context,
        normativePackageId: undefined,
      } as unknown as MobileCommandContext,
    }),
  ).toEqual({ allowed: false, reason: 'context-invalid' });
});
