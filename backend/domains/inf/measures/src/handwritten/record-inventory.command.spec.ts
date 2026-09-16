// CTG-0004 §1, §4.4 e §11 (R-0008, TASK-0008) — C-0004-01 (linha
// `inventory-vehicle`) e C-0004-11. `handwritten/record-inventory.command.ts`
// nasce em TASK-0009. Relógio fixo em 2026-09-14.
//
// Nome esperado do export: `RecordInventoryCommand`, construtor `(deps)`,
// método `execute(measureId, dto)`.
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

/** admitidos de `inventory-vehicle` (CTG-0004 §1). */
const ALLOWED_STATES = [
  'REMOVIDO',
  'EM_DEPOSITO',
  'GUARDA_MONITORADA',
  'VIOLACAO_MONITORAMENTO',
  'NOTIFICADO',
];

/** Os quatro elementos do §1º do art. 14 (RN-TEAT-126, CTG-0004 §4.4). */
const FULL_INVENTORY_JSON = {
  objects_left: 'Fixture — nenhum objeto',
  missing_mandatory_equipment: 'Fixture — nenhum',
  body_condition: 'Fixture — sem avarias aparentes',
  withdrawal_deadline_notice: 'Fixture — ciência dada em campo',
};

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
      inventories: repository(),
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

async function recordInventory(
  dependencies: Deps,
  measureId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./record-inventory.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/measures/src/handwritten/record-inventory.command.ts ainda não existe (TASK-0009, CTG-0004 §4.4)',
      { cause },
    );
  }
  const exported =
    (loaded.RecordInventoryCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'record-inventory.command.ts não exporta um comando construtível (CTG-0004 §4.4)',
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
      'record-inventory.command.ts não expõe execute|handle|run (CTG-0004 §4.4)',
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

describe('CTG-0004 §1/§4.4 — inventory-vehicle: matriz de estados (C-0004-01, linha `inventory-vehicle`)', () => {
  for (const { id, state } of ALL_MEASURE_STATES) {
    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
    it(`dada medida ${id} em ${state} quando inventory-vehicle então ${admitted ? 'sucesso' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
      const dependencies = deps();
      const body = {
        vehicle_snapshot_id: VEHICLE_SNAPSHOT_ID,
        inventory_json: FULL_INVENTORY_JSON,
      };
      if (admitted) {
        await expect(
          recordInventory(dependencies, id, body),
        ).resolves.toMatchObject({ measure_id: id });
      } else {
        await expect(
          recordInventory(dependencies, id, body),
        ).rejects.toMatchObject({
          code: 'TEAT.MEASURE_STATE_INVALID',
          status: 409,
          context: expect.objectContaining({
            measureId: id,
            currentState: state,
            allowed: ALLOWED_STATES,
            command: 'inventory-vehicle',
          }),
        });
      }
    });
  }
});

describe('CTG-0004 §4.4 — inventory-vehicle: conteúdo mínimo do §1º do art. 14 (C-0004-11, RN-TEAT-126)', () => {
  const MEASURE_REMOVIDO = ALL_MEASURE_STATES.find(
    (entry) => entry.state === 'REMOVIDO',
  )!.id;

  it('C-0004-11 — dado inventory_json sem os quatro elementos então 422 TEAT.MEASURE_TERM_MINIMUM_CONTENT com context.missing', async () => {
    const dependencies = deps();
    await expect(
      recordInventory(dependencies, MEASURE_REMOVIDO, {
        vehicle_snapshot_id: VEHICLE_SNAPSHOT_ID,
        inventory_json: { objects_left: 'Fixture — nenhum objeto' },
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.MEASURE_TERM_MINIMUM_CONTENT',
      status: 422,
      context: expect.objectContaining({
        missing: expect.arrayContaining([
          'missing_mandatory_equipment',
          'body_condition',
          'withdrawal_deadline_notice',
        ]),
      }),
    });
  });

  it('C-0004-11 — dado inventory_json com os quatro elementos então 201', async () => {
    const dependencies = deps();
    await expect(
      recordInventory(dependencies, MEASURE_REMOVIDO, {
        vehicle_snapshot_id: VEHICLE_SNAPSHOT_ID,
        inventory_json: FULL_INVENTORY_JSON,
      }),
    ).resolves.toMatchObject({ measure_id: MEASURE_REMOVIDO });
  });
});
