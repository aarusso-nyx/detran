// CTG-0004 §3, §5.5 e §11 (R-0008, TASK-0008) — C-0004-13 (linha `forward`).
// `handwritten/forward-procedure.command.ts` nasce em TASK-0009. Vocabulário
// de `forwarding_type` fixado pelo contrato (§5.5, §14 item 8): `exame_sangue`,
// `exame_clinico`, `exame_laboratorial`, `policia_judiciaria` — a coluna não
// tem check, é vocabulário de modelagem desta rodada, não token canônico.
// Relógio fixo em 2026-09-14.
//
// Nome esperado do export: `ForwardProcedureCommand`, construtor `(deps)`,
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

/** admitidos de `forward` (CTG-0004 §3). */
const ALLOWED_STATES = [
  'IMPOSSIBILIDADE_TECNICA',
  'RESULTADO_CRIME',
  'RESULTADO_ADMINISTRATIVO',
  'SINAIS_CONSTATADOS',
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
      forwardings: repository(),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => NOW },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function forwardProcedure(
  dependencies: Deps,
  procedureId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./forward-procedure.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/alcohol/src/handwritten/forward-procedure.command.ts ainda não existe (TASK-0009, CTG-0004 §5.5)',
      { cause },
    );
  }
  const exported =
    (loaded.ForwardProcedureCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'forward-procedure.command.ts não exporta um comando construtível (CTG-0004 §5.5)',
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
      'forward-procedure.command.ts não expõe execute|handle|run (CTG-0004 §5.5)',
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

const BASE_BODY = {
  forwarding_type: 'exame_sangue',
  destination: 'Fixture — Instituto Médico Legal',
};

describe('CTG-0004 §3/§5.5 — forward: matriz de estados (C-0004-13, linha `forward`)', () => {
  for (const { id, state } of ALL_PROCEDURE_STATES) {
    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
    it(`dado procedimento ${id} em ${state} quando forward então ${admitted ? 'sucesso' : '409 TEAT.ALCOHOL_STATE_INVALID'}`, async () => {
      const dependencies = deps();
      if (admitted) {
        await expect(
          forwardProcedure(dependencies, id, BASE_BODY),
        ).resolves.toMatchObject({ procedure_id: id });
      } else {
        await expect(
          forwardProcedure(dependencies, id, BASE_BODY),
        ).rejects.toMatchObject({
          code: 'TEAT.ALCOHOL_STATE_INVALID',
          status: 409,
          context: expect.objectContaining({
            procedureId: id,
            currentState: state,
            allowed: ALLOWED_STATES,
            command: 'forward',
          }),
        });
      }
    });
  }
});

describe('CTG-0004 §5.5 — forward: transição condicional para OUTRO_MEIO_PROVA', () => {
  const PROCEDURE_IMPOSSIBILIDADE = ALL_PROCEDURE_STATES.find(
    (entry) => entry.state === 'IMPOSSIBILIDADE_TECNICA',
  )!.id;
  const PROCEDURE_SINAIS = ALL_PROCEDURE_STATES.find(
    (entry) => entry.state === 'SINAIS_CONSTATADOS',
  )!.id;

  it('dado forwarding_type de exame a partir de IMPOSSIBILIDADE_TECNICA então status=OUTRO_MEIO_PROVA', async () => {
    const dependencies = deps();
    const result = await forwardProcedure(
      dependencies,
      PROCEDURE_IMPOSSIBILIDADE,
      BASE_BODY,
    );
    expect(result.procedure_status).toBe('OUTRO_MEIO_PROVA');
  });

  it('dado forward a partir de SINAIS_CONSTATADOS então o status não muda', async () => {
    const dependencies = deps();
    const result = await forwardProcedure(
      dependencies,
      PROCEDURE_SINAIS,
      BASE_BODY,
    );
    expect(result.procedure_status).toBe('SINAIS_CONSTATADOS');
  });

  it('dado forwarding_type fora do vocabulário então 422 TEAT.ENUM_INVALID com { field: "forwarding_type" }', async () => {
    const dependencies = deps();
    await expect(
      forwardProcedure(dependencies, PROCEDURE_IMPOSSIBILIDADE, {
        ...BASE_BODY,
        forwarding_type: 'destino_invalido',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.ENUM_INVALID',
      status: 422,
      context: expect.objectContaining({ field: 'forwarding_type' }),
    });
  });
});
