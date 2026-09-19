// CTG-0004 §1, §2, §4.3 e §11 (R-0008, TASK-0008) — C-0004-01 (linha
// `register-removal`), C-0004-04, C-0004-05, C-0004-06 e C-0004-07.
// `handwritten/record-removal.command.ts` nasce em TASK-0009. Fixtures:
// `28-fixtures-teat-measures-alcohol.sql` (`…ec100001/2` tow_provider
// ativo/inativo, `…ec200001/2` yard ativo/inativo). Relógio fixo em
// 2026-09-14.
//
// Nome esperado do export: `RecordRemovalCommand`, construtor `(deps)`,
// método `execute(measureId, dto)`. `deps.featureFlags.isEnabled('teat.monitored_custody')`
// é a porta de flag (parameter-catalogue.md §TEAT); `deps.deadlines.computeMeasureDue`
// é a mesma porta de `deadlines.spec.ts`.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const VEHICLE_SNAPSHOT_ID = '00000000-0000-7000-8000-0000ef600001';
const TOW_PROVIDER_ACTIVE = '00000000-0000-7000-8000-0000ec100001';
const TOW_PROVIDER_INACTIVE = '00000000-0000-7000-8000-0000ec100002';
const YARD_ACTIVE = '00000000-0000-7000-8000-0000ec200001';
const YARD_INACTIVE = '00000000-0000-7000-8000-0000ec200002';
const NOW = '2026-09-14T15:00:00.000Z';

const ALL_MEASURE_STATES = [
  { id: '00000000-0000-7000-8000-0000ed000001', state: 'RETIDO' },
  { id: '00000000-0000-7000-8000-0000ed000002', state: 'LIBERADO_LOCAL' },
  { id: '00000000-0000-7000-8000-0000ed000003', state: 'LIBERADO_COM_PRAZO' },
  { id: '00000000-0000-7000-8000-0000ed000004', state: 'REGULARIZADO' },
  { id: '00000000-0000-7000-8000-0000ed000005', state: 'CONVERTIDO_REMOCAO' },
  { id: '00000000-0000-7000-8000-0000ed000006', state: 'REMOVIDO' },
  { id: '00000000-0000-7000-8000-0000ed000007', state: 'EM_DEPOSITO' },
  { id: '00000000-0000-7000-8000-0000ed000008', state: 'GUARDA_MONITORADA' },
  {
    id: '00000000-0000-7000-8000-0000ed000009',
    state: 'VIOLACAO_MONITORAMENTO',
  },
  { id: '00000000-0000-7000-8000-0000ed000010', state: 'NOTIFICADO' },
  { id: '00000000-0000-7000-8000-0000ed000011', state: 'RESTITUIDO' },
  { id: '00000000-0000-7000-8000-0000ed000012', state: 'LEILAO' },
] as const;

/** admitidos de `register-removal` (CTG-0004 §1). */
const ALLOWED_STATES = ['RETIDO', 'LIBERADO_COM_PRAZO', 'CONVERTIDO_REMOCAO'];

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
      const row = store.find((entry) => entry.id === id);
      if (row) Object.assign(row, patch);
      return row;
    }),
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
  outbox: { append: ReturnType<typeof vi.fn> };
  clock: { now(): string };
  deadlines: {
    computeMeasureDue: (
      code: string,
      startOn: string,
      tenantId: string,
    ) => Promise<{ rawDueOn: string; dueOn: string }>;
  };
  featureFlags: { isEnabled: (flag: string) => boolean };
}

function measuresRepo(overrides: Record<string, unknown>[] = []) {
  return repository(
    overrides.length > 0
      ? overrides
      : ALL_MEASURE_STATES.map(({ id, state }) => ({
          id,
          tenant_id: TENANT_ID,
          current_status: state,
          started_at: '2026-09-14T09:00:00-04:00',
        })),
  );
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
      measures: measuresRepo(),
      removals: repository(),
      history: repository(),
      towProviders: repository([
        { id: TOW_PROVIDER_ACTIVE, tenant_id: TENANT_ID, status: 'active' },
        {
          id: TOW_PROVIDER_INACTIVE,
          tenant_id: TENANT_ID,
          status: 'inactive',
        },
      ]),
      yards: repository([
        { id: YARD_ACTIVE, tenant_id: TENANT_ID, status: 'active' },
        { id: YARD_INACTIVE, tenant_id: TENANT_ID, status: 'inactive' },
      ]),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => NOW },
    deadlines: overrides.deadlines ?? {
      computeMeasureDue: vi.fn(async () => ({
        rawDueOn: '2026-09-29',
        dueOn: '2026-09-29',
      })),
    },
    featureFlags: overrides.featureFlags ?? {
      isEnabled: () => false,
    },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function recordRemoval(
  dependencies: Deps,
  measureId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./record-removal.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/measures/src/handwritten/record-removal.command.ts ainda não existe (TASK-0009, CTG-0004 §4.3)',
      { cause },
    );
  }
  const exported =
    (loaded.RecordRemovalCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'record-removal.command.ts não exporta um comando construtível (CTG-0004 §4.3)',
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
      'record-removal.command.ts não expõe execute|handle|run (CTG-0004 §4.3)',
    );
  }
  return (await (
    method as (id: string, body: unknown) => Promise<unknown>
  ).call(command, measureId, body)) as Record<string, unknown>;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

const BASE_BODY = { vehicle_snapshot_id: VEHICLE_SNAPSHOT_ID };

describe('CTG-0004 §1/§4.3 — register-removal: matriz de estados (C-0004-01, linha `register-removal`)', () => {
  for (const { id, state } of ALL_MEASURE_STATES) {
    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
    it(`dada medida ${id} em ${state} quando register-removal então ${admitted ? 'sucesso' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
      const dependencies = deps();
      if (admitted) {
        await expect(
          recordRemoval(dependencies, id, BASE_BODY),
        ).resolves.toMatchObject({ measure_id: id });
      } else {
        await expect(
          recordRemoval(dependencies, id, BASE_BODY),
        ).rejects.toMatchObject({
          code: 'TEAT.MEASURE_STATE_INVALID',
          status: 409,
          context: expect.objectContaining({
            measureId: id,
            currentState: state,
            allowed: ALLOWED_STATES,
            command: 'register-removal',
          }),
        });
      }
    });
  }
});

describe('CTG-0004 §2/§4.3 — register-removal: limite de 15 dias (C-0004-04, RN-TEAT-125)', () => {
  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;

  it('C-0004-04 — dado regularization_deadline_days=16 então 422 TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED com { days: 16, limit: 15 }', async () => {
    const dependencies = deps();
    await expect(
      recordRemoval(dependencies, MEASURE_RETIDO, {
        ...BASE_BODY,
        regularization_deadline_days: 16,
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED',
      status: 422,
      context: expect.objectContaining({ days: 16, limit: 15 }),
    });
  });

  it('C-0004-04 — dado regularization_deadline_days=15 então 201 com regularization_deadline_at = computeDue(T-REG15)', async () => {
    const dependencies = deps();
    const result = await recordRemoval(dependencies, MEASURE_RETIDO, {
      ...BASE_BODY,
      regularization_deadline_days: 15,
    });
    expect(result.regularization_deadline_at).toBe('2026-09-29');
    expect(dependencies.deadlines.computeMeasureDue).toHaveBeenCalledWith(
      'T-REG15',
      expect.any(String),
      TENANT_ID,
    );
  });
});

describe('CTG-0004 §2/§4.3 — register-removal: guarda monitorada atrás da flag (C-0004-05, DT-015)', () => {
  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;

  it('C-0004-05 — dado destination_description="guarda_monitorada" e teat.monitored_custody=false então 422 TEAT.MEASURE_MONITORED_CUSTODY_DISABLED', async () => {
    const dependencies = deps({ featureFlags: { isEnabled: () => false } });
    await expect(
      recordRemoval(dependencies, MEASURE_RETIDO, {
        ...BASE_BODY,
        destination_description: 'guarda_monitorada',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.MEASURE_MONITORED_CUSTODY_DISABLED',
      status: 422,
      context: expect.objectContaining({ destination: 'guarda_monitorada' }),
    });
  });

  it('C-0004-05 — dado destination_description="guarda_monitorada" e teat.monitored_custody=true então 201 e current_status=GUARDA_MONITORADA', async () => {
    const dependencies = deps({ featureFlags: { isEnabled: () => true } });
    const result = await recordRemoval(dependencies, MEASURE_RETIDO, {
      ...BASE_BODY,
      destination_description: 'guarda_monitorada',
    });
    expect(result.current_status).toBe('GUARDA_MONITORADA');
  });
});

describe('CTG-0004 §4.3 — register-removal: prestador/pátio inativos (C-0004-06)', () => {
  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;

  it('C-0004-06 — dado tow_provider_id inativo (…ec100002) então 422 TEAT.MEASURE_TOW_PROVIDER_INACTIVE', async () => {
    const dependencies = deps();
    await expect(
      recordRemoval(dependencies, MEASURE_RETIDO, {
        ...BASE_BODY,
        tow_provider_id: TOW_PROVIDER_INACTIVE,
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.MEASURE_TOW_PROVIDER_INACTIVE',
      status: 422,
      context: expect.objectContaining({
        towProviderId: TOW_PROVIDER_INACTIVE,
      }),
    });
  });

  it('C-0004-06 — dado yard_id inativo (…ec200002) então 422 TEAT.MEASURE_YARD_INACTIVE', async () => {
    const dependencies = deps();
    await expect(
      recordRemoval(dependencies, MEASURE_RETIDO, {
        ...BASE_BODY,
        yard_id: YARD_INACTIVE,
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.MEASURE_YARD_INACTIVE',
      status: 422,
      context: expect.objectContaining({ yardId: YARD_INACTIVE }),
    });
  });

  it('C-0004-06 — dado tow_provider_id e yard_id ativos então 201', async () => {
    const dependencies = deps();
    await expect(
      recordRemoval(dependencies, MEASURE_RETIDO, {
        ...BASE_BODY,
        tow_provider_id: TOW_PROVIDER_ACTIVE,
        yard_id: YARD_ACTIVE,
      }),
    ).resolves.toMatchObject({ measure_id: MEASURE_RETIDO });
  });
});

describe('CTG-0004 §4.3 — register-removal: duas transições a partir de RETIDO (C-0004-07)', () => {
  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;
  const MEASURE_CONVERTIDO = ALL_MEASURE_STATES.find(
    (entry) => entry.state === 'CONVERTIDO_REMOCAO',
  )!.id;

  it('C-0004-07 — dado register-removal a partir de RETIDO então current_status final é REMOVIDO e duas linhas de measure_status_history (CONVERTIDO_REMOCAO, REMOVIDO), nessa ordem', async () => {
    const dependencies = deps();
    const result = await recordRemoval(dependencies, MEASURE_RETIDO, BASE_BODY);
    expect(result.current_status).toBe('REMOVIDO');
    const historyStatuses = dependencies.repositories.history.rows.map(
      (row) => row.status,
    );
    expect(historyStatuses).toEqual(['CONVERTIDO_REMOCAO', 'REMOVIDO']);
  });

  it('C-0004-07 — dado register-removal a partir de CONVERTIDO_REMOCAO então uma única transição direta para REMOVIDO', async () => {
    const dependencies = deps();
    const result = await recordRemoval(
      dependencies,
      MEASURE_CONVERTIDO,
      BASE_BODY,
    );
    expect(result.current_status).toBe('REMOVIDO');
    const historyStatuses = dependencies.repositories.history.rows.map(
      (row) => row.status,
    );
    expect(historyStatuses).toEqual(['REMOVIDO']);
  });
});
