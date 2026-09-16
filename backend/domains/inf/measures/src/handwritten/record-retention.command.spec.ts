// CTG-0004 §1, §2, §4.2 e §11 (R-0008, TASK-0008) — C-0004-01 (linha
// `register-retention`) e C-0004-03. `handwritten/record-retention.command.ts`
// nasce em TASK-0009. Fixtures: `28-fixtures-teat-measures-alcohol.sql`.
// Relógio fixo em 2026-09-14 (segunda-feira).
//
// Nome esperado do export: `RecordRetentionCommand`, construtor `(deps)`,
// método `execute(measureId, dto)`. `deps.deadlines.computeMeasureDue(code,
// startOn, tenantId)` é a mesma porta proposta em `deadlines.spec.ts` —
// mockada aqui para não duplicar a prova de calendário.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const VEHICLE_SNAPSHOT_ID = '00000000-0000-7000-8000-0000ef600001';
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

/** admitidos de `register-retention` (CTG-0004 §1: só RETIDO). */
const ALLOWED_STATES = ['RETIDO'];

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
}

function measuresRepo() {
  return repository(
    ALL_MEASURE_STATES.map(({ id, state }) => ({
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
      retentions: repository(),
      history: repository(),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => NOW },
    deadlines: overrides.deadlines ?? {
      computeMeasureDue: vi.fn(async () => ({
        rawDueOn: '2026-10-14',
        dueOn: '2026-10-14',
      })),
    },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function recordRetention(
  dependencies: Deps,
  measureId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./record-retention.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/measures/src/handwritten/record-retention.command.ts ainda não existe (TASK-0009, CTG-0004 §4.2)',
      { cause },
    );
  }
  const exported =
    (loaded.RecordRetentionCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'record-retention.command.ts não exporta um comando construtível (CTG-0004 §4.2)',
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
      'record-retention.command.ts não expõe execute|handle|run (CTG-0004 §4.2)',
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

const BASE_BODY = {
  vehicle_snapshot_id: VEHICLE_SNAPSHOT_ID,
  retention_reason: 'Fixture — falta de CNH',
};

describe('CTG-0004 §1/§4.2 — register-retention: matriz de estados (C-0004-01, linha `register-retention`)', () => {
  for (const { id, state } of ALL_MEASURE_STATES) {
    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
    it(`dada medida ${id} em ${state} quando register-retention então ${admitted ? 'sucesso' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
      const dependencies = deps();
      if (admitted) {
        await expect(
          recordRetention(dependencies, id, BASE_BODY),
        ).resolves.toMatchObject({ measure_id: id });
      } else {
        await expect(
          recordRetention(dependencies, id, BASE_BODY),
        ).rejects.toMatchObject({
          code: 'TEAT.MEASURE_STATE_INVALID',
          status: 409,
          context: expect.objectContaining({
            measureId: id,
            currentState: state,
            allowed: ALLOWED_STATES,
            command: 'register-retention',
          }),
        });
      }
    });
  }
});

describe('CTG-0004 §2/§4.2 — register-retention: limite de 30 dias (C-0004-03, RN-TEAT-124)', () => {
  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;

  it('C-0004-03 — dado regularization_deadline_days=31 então 422 TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED com { days: 31, limit: 30 }', async () => {
    const dependencies = deps();
    await expect(
      recordRetention(dependencies, MEASURE_RETIDO, {
        ...BASE_BODY,
        regularization_deadline_days: 31,
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED',
      status: 422,
      context: expect.objectContaining({
        days: 31,
        limit: 30,
        legalBasis: expect.any(String),
      }),
    });
  });

  it('C-0004-03 — dado regularization_deadline_days=30 então 201 com regularization_deadline_at = computeDue(T-REG30)', async () => {
    const dependencies = deps();
    const result = await recordRetention(dependencies, MEASURE_RETIDO, {
      ...BASE_BODY,
      regularization_deadline_days: 30,
    });
    expect(result).toMatchObject({
      measure_id: MEASURE_RETIDO,
      regularization_deadline_at: '2026-10-14',
      regularization_deadline_days: 30,
    });
    expect(dependencies.deadlines.computeMeasureDue).toHaveBeenCalledWith(
      'T-REG30',
      '2026-09-14',
      TENANT_ID,
    );
  });

  it('C-0004-03 — dado regularization_deadline_days ausente então regularization_deadline_at é nulo (RN-TEAT-124 só se aplica quando o dado vem do campo)', async () => {
    const dependencies = deps();
    const result = await recordRetention(
      dependencies,
      MEASURE_RETIDO,
      BASE_BODY,
    );
    expect(result.regularization_deadline_at ?? null).toBeNull();
  });
});
