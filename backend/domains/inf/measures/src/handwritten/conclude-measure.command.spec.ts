// CTG-0004 §1, §4.7 e §11 (R-0008, TASK-0008) — C-0004-01 (linha `conclude`).
// `handwritten/conclude-measure.command.ts` nasce em TASK-0009. Relógio fixo
// em 2026-09-14.
//
// Nome esperado do export: `ConcludeMeasureCommand`, construtor `(deps)`,
// método `execute(measureId, dto)`.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
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

/** admitidos de `conclude` (CTG-0004 §1: só LIBERADO_COM_PRAZO). */
const ALLOWED_STATES = ['LIBERADO_COM_PRAZO'];

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
}

function measuresRepo() {
  return repository(
    ALL_MEASURE_STATES.map(({ id, state }) => ({
      id,
      tenant_id: TENANT_ID,
      current_status: state,
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
      history: repository(),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => NOW },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function concludeMeasure(
  dependencies: Deps,
  measureId: string,
  body: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./conclude-measure.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/measures/src/handwritten/conclude-measure.command.ts ainda não existe (TASK-0009, CTG-0004 §4.7)',
      { cause },
    );
  }
  const exported =
    (loaded.ConcludeMeasureCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'conclude-measure.command.ts não exporta um comando construtível (CTG-0004 §4.7)',
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
      'conclude-measure.command.ts não expõe execute|handle|run (CTG-0004 §4.7)',
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

describe('CTG-0004 §1/§4.7 — conclude: matriz de estados (C-0004-01, linha `conclude`)', () => {
  for (const { id, state } of ALL_MEASURE_STATES) {
    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
    it(`dada medida ${id} em ${state} quando conclude então ${admitted ? 'sucesso, current_status=REGULARIZADO' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
      const dependencies = deps();
      if (admitted) {
        const result = await concludeMeasure(dependencies, id);
        expect(result).toMatchObject({
          current_status: 'REGULARIZADO',
          ended_at: expect.any(String),
        });
      } else {
        await expect(concludeMeasure(dependencies, id)).rejects.toMatchObject({
          code: 'TEAT.MEASURE_STATE_INVALID',
          status: 409,
          context: expect.objectContaining({
            measureId: id,
            currentState: state,
            allowed: ALLOWED_STATES,
            command: 'conclude',
          }),
        });
      }
    });
  }
});

describe('CTG-0004 §4.7 — conclude: evento MEDIDA_CONCLUIDA', () => {
  const MEASURE_COM_PRAZO = ALL_MEASURE_STATES.find(
    (entry) => entry.state === 'LIBERADO_COM_PRAZO',
  )!.id;

  it('dado conclude então measure.changed/MEDIDA_CONCLUIDA é publicado com fromState e toState', async () => {
    const dependencies = deps();
    await concludeMeasure(dependencies, MEASURE_COM_PRAZO);
    expect(dependencies.outbox.append).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'measure.changed',
        domainEvent: 'MEDIDA_CONCLUIDA',
        aggregate: expect.objectContaining({
          kind: 'administrative-measure',
          id: MEASURE_COM_PRAZO,
        }),
        data: expect.objectContaining({
          measureId: MEASURE_COM_PRAZO,
          fromState: 'LIBERADO_COM_PRAZO',
          toState: 'REGULARIZADO',
        }),
      }),
    );
  });
});
