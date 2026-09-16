// CTG-0004 §3, §5.6 e §11 (R-0008, TASK-0008) — C-0004-13 (linha `close`),
// C-0004-23 e C-0004-24. `handwritten/close-procedure.command.ts` nasce em
// TASK-0009. Fixtures: `28-fixtures-teat-measures-alcohol.sql`
// (`…ee100001`, encaminhamento já registrado para o procedimento
// RESULTADO_CRIME `…ee000007`). Relógio fixo em 2026-09-14.
//
// Nome esperado do export: `CloseProcedureCommand`, construtor `(deps)`,
// método `execute(procedureId, dto)`.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const FORWARDING_EXISTING = '00000000-0000-7000-8000-0000ee100001';
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

/** admitidos de `close` (CTG-0004 §3). */
const ALLOWED_STATES = [
  'RECUSA_REGISTRADA',
  'RESULTADO_ABAIXO_LIMITE',
  'RESULTADO_ADMINISTRATIVO',
  'RESULTADO_CRIME',
  'SINAIS_CONSTATADOS',
  'OUTRO_MEIO_PROVA',
];

/** terminal esperado por pré-estado (CTG-0004 §5.6). */
const TERMINAL_BY_STATE: Record<string, string> = {
  RECUSA_REGISTRADA: 'AIT_165A_LAVRADO',
  RESULTADO_ADMINISTRATIVO: 'AIT_165_LAVRADO',
  SINAIS_CONSTATADOS: 'AIT_165_LAVRADO',
  RESULTADO_ABAIXO_LIMITE: 'SEM_AUTUACAO_ALCOOLEMIA',
};

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    findByProcedure: vi.fn(async (procedureId: string) =>
      store.filter((row) => row.procedure_id === procedureId),
    ),
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

const PROCEDURE_RESULTADO_CRIME = ALL_PROCEDURE_STATES.find(
  (entry) => entry.state === 'RESULTADO_CRIME',
)!.id;

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
      forwardings: repository([
        {
          id: FORWARDING_EXISTING,
          tenant_id: TENANT_ID,
          procedure_id: PROCEDURE_RESULTADO_CRIME,
          forwarding_type: 'policia_judiciaria',
        },
      ]),
      tests: repository([
        {
          id: 'test-crime-1',
          tenant_id: TENANT_ID,
          procedure_id: PROCEDURE_RESULTADO_CRIME,
          considered_mg_l: 0.45,
        },
      ]),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => NOW },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function closeProcedure(
  dependencies: Deps,
  procedureId: string,
  body: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./close-procedure.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/alcohol/src/handwritten/close-procedure.command.ts ainda não existe (TASK-0009, CTG-0004 §5.6)',
      { cause },
    );
  }
  const exported =
    (loaded.CloseProcedureCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'close-procedure.command.ts não exporta um comando construtível (CTG-0004 §5.6)',
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
      'close-procedure.command.ts não expõe execute|handle|run (CTG-0004 §5.6)',
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

describe('CTG-0004 §3/§5.6 — close: matriz de estados (C-0004-13, linha `close`)', () => {
  for (const { id, state } of ALL_PROCEDURE_STATES) {
    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
    it(`dado procedimento ${id} em ${state} quando close então ${admitted ? 'sucesso' : '409 TEAT.ALCOHOL_STATE_INVALID'}`, async () => {
      const dependencies = deps();
      const body =
        state === 'OUTRO_MEIO_PROVA'
          ? { outcome: 'RESULTADO_ADMINISTRATIVO' }
          : {};
      if (admitted) {
        await expect(
          closeProcedure(dependencies, id, body),
        ).resolves.toMatchObject({ id });
      } else {
        await expect(
          closeProcedure(dependencies, id, body),
        ).rejects.toMatchObject({
          code: 'TEAT.ALCOHOL_STATE_INVALID',
          status: 409,
          context: expect.objectContaining({
            procedureId: id,
            currentState: state,
            allowed: ALLOWED_STATES,
            command: 'close',
          }),
        });
      }
    });
  }
});

describe('CTG-0004 §5.6 — close: RESULTADO_CRIME exige forwarding (C-0004-23, RN-TEAT-137)', () => {
  it('C-0004-23 — dado close em …ee000007 (RESULTADO_CRIME) sem forwarding então 422 TEAT.ALCOHOL_FORWARDING_REQUIRED_FOR_CRIME com { consideredMgL, threshold: 0.34 }', async () => {
    const dependencies = deps({
      repositories: {
        procedures: proceduresRepo(),
        forwardings: repository([]),
        tests: repository([
          {
            id: 'test-crime-1',
            tenant_id: TENANT_ID,
            procedure_id: PROCEDURE_RESULTADO_CRIME,
            considered_mg_l: 0.45,
          },
        ]),
      },
    });
    await expect(
      closeProcedure(dependencies, PROCEDURE_RESULTADO_CRIME),
    ).rejects.toMatchObject({
      code: 'TEAT.ALCOHOL_FORWARDING_REQUIRED_FOR_CRIME',
      status: 422,
      context: expect.objectContaining({
        procedureId: PROCEDURE_RESULTADO_CRIME,
        consideredMgL: 0.45,
        threshold: 0.34,
      }),
    });
  });

  it('C-0004-23 — dado close em …ee000007 com o forwarding …ee100001 já registrado então status=ENCAMINHADO_POLICIA_JUDICIARIA', async () => {
    const dependencies = deps();
    const result = await closeProcedure(
      dependencies,
      PROCEDURE_RESULTADO_CRIME,
    );
    expect(result.status).toBe('ENCAMINHADO_POLICIA_JUDICIARIA');
  });
});

describe('CTG-0004 §5.6 — close: terminal por pré-estado, um a um (C-0004-24)', () => {
  for (const [state, terminal] of Object.entries(TERMINAL_BY_STATE)) {
    it(`dado close a partir de ${state} então status final ${terminal}`, async () => {
      const procedureId = ALL_PROCEDURE_STATES.find(
        (entry) => entry.state === state,
      )!.id;
      const dependencies = deps();
      const result = await closeProcedure(dependencies, procedureId);
      expect(result.status).toBe(terminal);
    });
  }

  it('dado close a partir de OUTRO_MEIO_PROVA sem outcome então 422 TEAT.ALCOHOL_TERM_MINIMUM_CONTENT com missing=["outcome"]', async () => {
    const procedureId = ALL_PROCEDURE_STATES.find(
      (entry) => entry.state === 'OUTRO_MEIO_PROVA',
    )!.id;
    const dependencies = deps();
    await expect(
      closeProcedure(dependencies, procedureId, {}),
    ).rejects.toMatchObject({
      code: 'TEAT.ALCOHOL_TERM_MINIMUM_CONTENT',
      status: 422,
      context: expect.objectContaining({ missing: ['outcome'] }),
    });
  });

  it('dado close a partir de OUTRO_MEIO_PROVA com outcome=RESULTADO_CRIME então o terminal é ENCAMINHADO_POLICIA_JUDICIARIA (a mesma guarda de forwarding se aplica)', async () => {
    const procedureId = ALL_PROCEDURE_STATES.find(
      (entry) => entry.state === 'OUTRO_MEIO_PROVA',
    )!.id;
    const dependencies = deps({
      repositories: {
        procedures: proceduresRepo(),
        forwardings: repository([
          {
            id: 'forwarding-outro-meio',
            tenant_id: TENANT_ID,
            procedure_id: procedureId,
            forwarding_type: 'policia_judiciaria',
          },
        ]),
        tests: repository([
          {
            id: 'test-outro-meio',
            tenant_id: TENANT_ID,
            procedure_id: procedureId,
            considered_mg_l: 0.4,
          },
        ]),
      },
    });
    const result = await closeProcedure(dependencies, procedureId, {
      outcome: 'RESULTADO_CRIME',
    });
    expect(result.status).toBe('ENCAMINHADO_POLICIA_JUDICIARIA');
  });
});
