// CTG-0004 §3, §5.4 e §11 (R-0008, TASK-0008) — C-0004-13 (linha
// `record-psychomotor-signs`) e C-0004-22. `handwritten/record-signs.command.ts`
// nasce em TASK-0009. Relógio fixo em 2026-09-14.
//
// Nome esperado do export: `RecordSignsCommand`, construtor `(deps)`, método
// `execute(procedureId, dto)`.
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

/** admitidos de `record-psychomotor-signs` (CTG-0004 §3). */
const ALLOWED_STATES = [
  'TRIAGEM',
  'ETILOMETRO_OFERECIDO',
  'IMPOSSIBILIDADE_TECNICA',
  'OUTRO_MEIO_PROVA',
];
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
      signs: repository(),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => NOW },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function recordSigns(
  dependencies: Deps,
  procedureId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./record-signs.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/alcohol/src/handwritten/record-signs.command.ts ainda não existe (TASK-0009, CTG-0004 §5.4)',
      { cause },
    );
  }
  const exported =
    (loaded.RecordSignsCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'record-signs.command.ts não exporta um comando construtível (CTG-0004 §5.4)',
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
      'record-signs.command.ts não expõe execute|handle|run (CTG-0004 §5.4)',
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

const TWO_SIGNS = [
  { sign_code: 'ODOR_ETILICO', description: 'Odor etílico', observed: true },
  {
    sign_code: 'OLHOS_AVERMELHADOS',
    description: 'Olhos avermelhados',
    observed: true,
  },
];

describe('CTG-0004 §3/§5.4 — record-psychomotor-signs: matriz de estados (C-0004-13, linha `record-psychomotor-signs`)', () => {
  for (const { id, state } of ALL_PROCEDURE_STATES) {
    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
    it(`dado procedimento ${id} em ${state} quando record-psychomotor-signs (2 sinais) então ${admitted ? 'sucesso' : '409 TEAT.ALCOHOL_STATE_INVALID'}`, async () => {
      const dependencies = deps();
      const body = { signs: TWO_SIGNS };
      if (admitted) {
        await expect(
          recordSigns(dependencies, id, body),
        ).resolves.toMatchObject({ procedure_id: id });
      } else {
        await expect(recordSigns(dependencies, id, body)).rejects.toMatchObject(
          {
            code: 'TEAT.ALCOHOL_STATE_INVALID',
            status: 409,
            context: expect.objectContaining({
              procedureId: id,
              currentState: state,
              allowed: ALLOWED_STATES,
              command: 'record-psychomotor-signs',
            }),
          },
        );
      }
    });
  }
});

describe('CTG-0004 §5.4 — record-psychomotor-signs: conjunto de ao menos dois sinais (C-0004-22, RN-TEAT-132)', () => {
  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
    (entry) => entry.state === 'TRIAGEM',
  )!.id;

  it('C-0004-22 — dado um único sinal observed então 422 TEAT.ALCOHOL_SIGNS_SET_REQUIRED com { observed: 1, required: 2 }', async () => {
    const dependencies = deps();
    await expect(
      recordSigns(dependencies, PROCEDURE_TRIAGEM, {
        signs: [TWO_SIGNS[0]],
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.ALCOHOL_SIGNS_SET_REQUIRED',
      status: 422,
      context: expect.objectContaining({
        observed: 1,
        required: 2,
        legalBasis: expect.any(String),
      }),
    });
  });

  it('C-0004-22 — dado dois sinais observed a partir de TRIAGEM então 201 e SINAIS_CONSTATADOS', async () => {
    const dependencies = deps();
    const result = await recordSigns(dependencies, PROCEDURE_TRIAGEM, {
      signs: TWO_SIGNS,
    });
    expect(result.procedure_status).toBe('SINAIS_CONSTATADOS');
  });

  it('dado um sinal com observed=false não contado então 422 (apenas os observed=true contam para o conjunto)', async () => {
    const dependencies = deps();
    await expect(
      recordSigns(dependencies, PROCEDURE_TRIAGEM, {
        signs: [TWO_SIGNS[0], { ...TWO_SIGNS[1], observed: false }],
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.ALCOHOL_SIGNS_SET_REQUIRED',
      context: expect.objectContaining({ observed: 1 }),
    });
  });

  for (const state of ['IMPOSSIBILIDADE_TECNICA', 'OUTRO_MEIO_PROVA']) {
    it(`dado dois sinais a partir de ${state} então o status não muda (§5.4: sinais complementam outro meio de prova)`, async () => {
      const procedureId = ALL_PROCEDURE_STATES.find(
        (entry) => entry.state === state,
      )!.id;
      const dependencies = deps();
      const result = await recordSigns(dependencies, procedureId, {
        signs: TWO_SIGNS,
      });
      expect(result.procedure_status).toBe(state);
    });
  }
});
