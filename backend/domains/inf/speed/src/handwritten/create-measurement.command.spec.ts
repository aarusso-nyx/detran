// CTG-0004 §6 e §11 (R-0008, TASK-0008) — C-0004-25, C-0004-26 e C-0004-27.
// `handwritten/create-measurement.command.ts` +
// `handwritten/speed-commands.controller.ts` nascem em TASK-0009. O módulo
// só monta atrás de `teat.speed_meters` (default false) — por isso **só**
// unit nesta rodada (CTG-0004 §6, M15): nenhum integration nem e2e.
// Fixtures: `28-fixtures-teat-measures-alcohol.sql` (`…ef900001` medidor
// acoplado, `…efa00001` certificado vigente até 2027-06-30). Relógio fixo
// em 2026-09-14.
//
// Nome esperado do export: `CreateMeasurementCommand`, construtor `(deps)`,
// método `execute(dto)`.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const METER_ID = '00000000-0000-7000-8000-0000ef900001';
const CERTIFICATE_VALID = '00000000-0000-7000-8000-0000efa00001';
const AIT_ID = '00000000-0000-7000-8000-0000f0000001';
const NOW = '2026-09-14T15:00:00.000Z';

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    create: vi.fn(async (values: Record<string, unknown>) => {
      const row = { id: `row-${store.length + 1}`, ...values };
      store.push(row);
      return row;
    }),
  };
}

interface Deps {
  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
  requestContext: {
    hasActiveContext(): boolean;
    snapshot(): { tenantId: string; actorId: string };
  };
  repositories: Record<string, ReturnType<typeof repository>>;
  clock: { now(): string };
}

function deps(overrides: Partial<Deps> = {}): Deps {
  return {
    database: overrides.database ?? {
      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
        return work({});
      },
    },
    requestContext: overrides.requestContext ?? {
      hasActiveContext: () => true,
      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
    },
    repositories: overrides.repositories ?? {
      measurements: repository(),
      meters: repository([
        { id: METER_ID, tenant_id: TENANT_ID, meter_type: 'movel_acoplado' },
      ]),
      certificates: repository([
        {
          id: CERTIFICATE_VALID,
          tenant_id: TENANT_ID,
          meter_id: METER_ID,
          valid_until: '2027-06-30',
        },
      ]),
    },
    clock: overrides.clock ?? { now: () => NOW },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function createMeasurement(
  dependencies: Deps,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./create-measurement.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/speed/src/handwritten/create-measurement.command.ts ainda não existe (TASK-0009, CTG-0004 §6)',
      { cause },
    );
  }
  const exported =
    (loaded.CreateMeasurementCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'create-measurement.command.ts não exporta um comando construtível (CTG-0004 §6)',
    );
  }
  const Command = exported as new (
    dependencies: unknown,
  ) => Record<string, unknown>;
  const command = new Command(dependencies);
  const method = ['execute', 'handle', 'run']
    .map((name) => command[name])
    .find((value) => typeof value === 'function');
  if (typeof method !== 'function') {
    throw new Error(
      'create-measurement.command.ts não expõe execute|handle|run (CTG-0004 §6)',
    );
  }
  return (await (method as (body: unknown) => Promise<unknown>).call(
    command,
    body,
  )) as Record<string, unknown>;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

function baseBody(overrides: Record<string, unknown> = {}) {
  return {
    meter_id: METER_ID,
    certificate_id: CERTIFICATE_VALID,
    measured_kmh: 100,
    max_error_kmh: 3,
    considered_kmh: 97,
    road_limit_kmh: 80,
    measured_at: '2026-09-14T10:00:00-04:00',
    latitude: -3.1019,
    longitude: -60.025,
    agent_id: ACTOR_ID,
    ...overrides,
  };
}

describe('CTG-0004 §6 — create-measurement: considered_kmh derivado (C-0004-25)', () => {
  it('C-0004-25 — dado considered_kmh ≠ measured_kmh − max_error_kmh então 422 TEAT.VALIDATION_FAILED, antes de qualquer escrita', async () => {
    const dependencies = deps();
    await expect(
      createMeasurement(dependencies, baseBody({ considered_kmh: 999 })),
    ).rejects.toMatchObject({ code: 'TEAT.VALIDATION_FAILED', status: 422 });
    expect(
      dependencies.repositories.measurements.create,
    ).not.toHaveBeenCalled();
  });

  it('dado considered_kmh = measured_kmh − max_error_kmh então 201', async () => {
    const dependencies = deps();
    await expect(
      createMeasurement(dependencies, baseBody()),
    ).resolves.toMatchObject({
      measured_kmh: 100,
      max_error_kmh: 3,
      considered_kmh: 97,
    });
  });
});

describe('CTG-0004 §6 — create-measurement: placa não confirmada com ait_id (C-0004-26, RN-TEAT-115)', () => {
  it('C-0004-26 — dado ait_id informado com plate_validated_by_agent=false então 422 TEAT.AIT_PLATE_NOT_CONFIRMED', async () => {
    const dependencies = deps();
    await expect(
      createMeasurement(
        dependencies,
        baseBody({
          ait_id: AIT_ID,
          plate_image_evidence_id: '00000000-0000-7000-8000-0000ef900099',
          plate_validated_by_agent: false,
        }),
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_PLATE_NOT_CONFIRMED',
      status: 422,
    });
  });

  it('dado ait_id informado com plate_validated_by_agent=true, plate_image_evidence_id e considered_kmh > road_limit_kmh então 201', async () => {
    const dependencies = deps();
    await expect(
      createMeasurement(
        dependencies,
        baseBody({
          ait_id: AIT_ID,
          plate_image_evidence_id: '00000000-0000-7000-8000-0000ef900099',
          plate_validated_by_agent: true,
        }),
      ),
    ).resolves.toMatchObject({ ait_id: AIT_ID });
  });
});

describe('CTG-0004 §6 — create-measurement: certificado vencido (C-0004-27, RN-TEAT-138)', () => {
  it('C-0004-27 — dado o certificado …efa00001 vencido em relação a measured_at então 422 TEAT.AIT_EQUIPMENT_REQUIRED com { meterId, certificateId }', async () => {
    const dependencies = deps({
      repositories: {
        measurements: repository(),
        meters: repository([
          { id: METER_ID, tenant_id: TENANT_ID, meter_type: 'movel_acoplado' },
        ]),
        certificates: repository([
          {
            id: CERTIFICATE_VALID,
            tenant_id: TENANT_ID,
            meter_id: METER_ID,
            valid_until: '2026-01-01',
          },
        ]),
      },
    });
    await expect(
      createMeasurement(dependencies, baseBody()),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_EQUIPMENT_REQUIRED',
      status: 422,
      context: expect.objectContaining({
        meterId: METER_ID,
        certificateId: CERTIFICATE_VALID,
      }),
    });
  });
});
