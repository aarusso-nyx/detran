// CTG-0004 §3, §5.3 e §11 (R-0008, TASK-0008) — C-0004-13 (linha
// `record-refusal`), C-0004-20 e C-0004-21. `handwritten/record-refusal.command.ts`
// nasce em TASK-0009. Relógio fixo em 2026-09-14.
//
// Nome esperado do export: `RecordRefusalCommand`, construtor `(deps)`,
// método `execute(procedureId, dto)`.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const NOW = '2026-09-14T15:00:00.000Z';

const ALL_PROCEDURE_STATES = [
  { id: '00000000-0000-7000-8000-0000ee000001', state: 'ABORDAGEM' },
  { id: '00000000-0000-7000-8000-0000ee000002', state: 'TRIAGEM' },
  { id: '00000000-0000-7000-8000-0000ee000003', state: 'ETILOMETRO_OFERECIDO' },
  { id: '00000000-0000-7000-8000-0000ee000004', state: 'TESTE_REALIZADO' },
  {
    id: '00000000-0000-7000-8000-0000ee000005',
    state: 'RESULTADO_ABAIXO_LIMITE',
  },
  {
    id: '00000000-0000-7000-8000-0000ee000006',
    state: 'RESULTADO_ADMINISTRATIVO',
  },
  { id: '00000000-0000-7000-8000-0000ee000007', state: 'RESULTADO_CRIME' },
  { id: '00000000-0000-7000-8000-0000ee000008', state: 'RECUSA_REGISTRADA' },
  {
    id: '00000000-0000-7000-8000-0000ee000009',
    state: 'IMPOSSIBILIDADE_TECNICA',
  },
  { id: '00000000-0000-7000-8000-0000ee000010', state: 'OUTRO_MEIO_PROVA' },
  { id: '00000000-0000-7000-8000-0000ee000011', state: 'SINAIS_CONSTATADOS' },
  { id: '00000000-0000-7000-8000-0000ee000012', state: 'AIT_165A_LAVRADO' },
  { id: '00000000-0000-7000-8000-0000ee000013', state: 'AIT_165_LAVRADO' },
  {
    id: '00000000-0000-7000-8000-0000ee000014',
    state: 'ENCAMINHADO_POLICIA_JUDICIARIA',
  },
  {
    id: '00000000-0000-7000-8000-0000ee000015',
    state: 'SEM_AUTUACAO_ALCOOLEMIA',
  },
] as const;

/** admitidos de `record-refusal` (CTG-0004 §3). */
const ALLOWED_STATES = ['TRIAGEM', 'ETILOMETRO_OFERECIDO'];

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

function proceduresRepo() {
  return repository(
    ALL_PROCEDURE_STATES.map(({ id, state }) => ({
      id,
      tenant_id: TENANT_ID,
      status: state,
      outcome: '',
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
      procedures: proceduresRepo(),
      refusals: repository(),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => NOW },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function recordRefusal(
  dependencies: Deps,
  procedureId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./record-refusal.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/alcohol/src/handwritten/record-refusal.command.ts ainda não existe (TASK-0009, CTG-0004 §5.3)',
      { cause },
    );
  }
  const exported =
    (loaded.RecordRefusalCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'record-refusal.command.ts não exporta um comando construtível (CTG-0004 §5.3)',
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
      'record-refusal.command.ts não expõe execute|handle|run (CTG-0004 §5.3)',
    );
  }
  return (await (
    method as (id: string, body: unknown) => Promise<unknown>
  ).call(command, procedureId, body)) as Record<string, unknown>;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

const BASE_BODY = { refusal_description: 'Fixture — condutor se recusou' };

describe('CTG-0004 §3/§5.3 — record-refusal: matriz de estados (C-0004-13, linha `record-refusal`)', () => {
  for (const { id, state } of ALL_PROCEDURE_STATES) {
    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
    it(`dado procedimento ${id} em ${state} quando record-refusal (kind=refusal) então ${admitted ? 'sucesso' : '409 TEAT.ALCOHOL_STATE_INVALID'}`, async () => {
      const dependencies = deps();
      const body = { ...BASE_BODY, kind: 'refusal' };
      if (admitted) {
        await expect(
          recordRefusal(dependencies, id, body),
        ).resolves.toMatchObject({ procedure_id: id });
      } else {
        await expect(
          recordRefusal(dependencies, id, body),
        ).rejects.toMatchObject({
          code: 'TEAT.ALCOHOL_STATE_INVALID',
          status: 409,
          context: expect.objectContaining({
            procedureId: id,
            currentState: state,
            allowed: ALLOWED_STATES,
            command: 'record-refusal',
          }),
        });
      }
    });
  }
});

describe('CTG-0004 §5.3 — record-refusal: kind obrigatório e nunca o mesmo estado (C-0004-20, C-0004-21)', () => {
  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
    (entry) => entry.state === 'TRIAGEM',
  )!.id;
  const PROCEDURE_ETILOMETRO = ALL_PROCEDURE_STATES.find(
    (entry) => entry.state === 'ETILOMETRO_OFERECIDO',
  )!.id;

  it('C-0004-20 — dado kind ausente então 400 TEAT.ALCOHOL_REFUSAL_KIND_REQUIRED', async () => {
    const dependencies = deps();
    await expect(
      recordRefusal(dependencies, PROCEDURE_TRIAGEM, BASE_BODY),
    ).rejects.toMatchObject({
      code: 'TEAT.ALCOHOL_REFUSAL_KIND_REQUIRED',
      status: 400,
    });
  });

  it("C-0004-21 — dado kind='refusal' então status=RECUSA_REGISTRADA", async () => {
    const dependencies = deps();
    const result = await recordRefusal(dependencies, PROCEDURE_TRIAGEM, {
      ...BASE_BODY,
      kind: 'refusal',
    });
    expect(result.procedure_status).toBe('RECUSA_REGISTRADA');
  });

  it("C-0004-21 — dado kind='technical_impossibility' então status=IMPOSSIBILIDADE_TECNICA (nunca RECUSA_REGISTRADA)", async () => {
    const dependencies = deps();
    const result = await recordRefusal(dependencies, PROCEDURE_ETILOMETRO, {
      ...BASE_BODY,
      kind: 'technical_impossibility',
    });
    expect(result.procedure_status).toBe('IMPOSSIBILIDADE_TECNICA');
    expect(result.procedure_status).not.toBe('RECUSA_REGISTRADA');
  });
});
