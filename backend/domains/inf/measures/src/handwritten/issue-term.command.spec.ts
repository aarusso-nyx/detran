// CTG-0004 §1, §2, §4.5 e §11 (R-0008, TASK-0008) — C-0004-01 (linha
// `apply-term`), C-0004-08, C-0004-09 e C-0004-10. `handwritten/issue-term.command.ts`
// nasce em TASK-0009. Relógio fixo em 2026-09-14.
//
// Nome esperado do export: `IssueTermCommand`, construtor `(deps)`, método
// `execute(measureId, dto)`. `deps.deadlines.computeMeasureDue` — mesma porta
// de `deadlines.spec.ts` (T-DEPOSITO6M).
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

/** admitidos de `apply-term` (CTG-0004 §1). */
const ALLOWED_STATES = [
  'RETIDO',
  'LIBERADO_LOCAL',
  'LIBERADO_COM_PRAZO',
  'REGULARIZADO',
  'CONVERTIDO_REMOCAO',
  'REMOVIDO',
];

/** Os sete elementos do caput do art. 14 (CTG-0004 §4.5 pré-condição 2). */
const FULL_FIELD_DETAILS = {
  agency: 'Fixture Órgão',
  vehicle: 'Fixture Veículo',
  ait_or_order_ref: 'AM-2026-000001',
  place_datetime: '2026-09-14T09:00:00-04:00',
  legal_basis: 'CTB art. 271',
  custody_place: 'Fixture Pátio',
  owner_and_driver: 'Fixture Proprietário/Condutor',
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
      terms: repository(),
      history: repository(),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => NOW },
    deadlines: overrides.deadlines ?? {
      computeMeasureDue: vi.fn(async () => ({
        rawDueOn: '2027-03-15',
        dueOn: '2027-03-15',
      })),
    },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function issueTerm(
  dependencies: Deps,
  measureId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./issue-term.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/measures/src/handwritten/issue-term.command.ts ainda não existe (TASK-0009, CTG-0004 §4.5)',
      { cause },
    );
  }
  const exported =
    (loaded.IssueTermCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'issue-term.command.ts não exporta um comando construtível (CTG-0004 §4.5)',
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
      'issue-term.command.ts não expõe execute|handle|run (CTG-0004 §4.5)',
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

let termCounter = 0;
function baseBody(overrides: Record<string, unknown> = {}) {
  termCounter += 1;
  return {
    term_type: 'inventory',
    term_number: `TERM-FIX-${termCounter}`,
    ...overrides,
  };
}

describe('CTG-0004 §1/§4.5 — apply-term: matriz de estados (C-0004-01, linha `apply-term`)', () => {
  for (const { id, state } of ALL_MEASURE_STATES) {
    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
    it(`dada medida ${id} em ${state} quando apply-term (term_type≠removal) então ${admitted ? 'sucesso' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
      const dependencies = deps();
      const body = baseBody();
      if (admitted) {
        await expect(issueTerm(dependencies, id, body)).resolves.toMatchObject({
          measure_id: id,
        });
      } else {
        await expect(issueTerm(dependencies, id, body)).rejects.toMatchObject({
          code: 'TEAT.MEASURE_STATE_INVALID',
          status: 409,
          context: expect.objectContaining({
            measureId: id,
            currentState: state,
            allowed: ALLOWED_STATES,
            command: 'apply-term',
          }),
        });
      }
    });
  }
});

describe('CTG-0004 §4.5 — apply-term term_type=removal: os dois prazos (C-0004-08, OD-T05)', () => {
  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;

  it('C-0004-08 — dado term_type=removal sem withdrawal_deadline_at então 422 TEAT.MEASURE_TERM_DEADLINE_MISSING com missing=["withdrawal_deadline_at"]', async () => {
    const dependencies = deps();
    await expect(
      issueTerm(
        dependencies,
        MEASURE_RETIDO,
        baseBody({
          term_type: 'removal',
          field_details_json: FULL_FIELD_DETAILS,
        }),
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.MEASURE_TERM_DEADLINE_MISSING',
      status: 422,
      context: expect.objectContaining({
        missing: ['withdrawal_deadline_at'],
      }),
    });
  });

  it('C-0004-08 — dado term_type=removal com withdrawal_deadline_at e field_details_json completos então 201 com os dois prazos gravados', async () => {
    const dependencies = deps();
    const result = await issueTerm(
      dependencies,
      MEASURE_RETIDO,
      baseBody({
        term_type: 'removal',
        withdrawal_deadline_at: '2026-09-21T00:00:00-04:00',
        issued_at: '2026-09-14T09:00:00-04:00',
        field_details_json: FULL_FIELD_DETAILS,
      }),
    );
    expect(result).toMatchObject({
      withdrawal_deadline_at: expect.any(String),
      ctb_deadline_at: '2027-03-15',
      status: 'issued',
    });
  });
});

describe('CTG-0004 §4.5 — apply-term term_type=removal: conteúdo mínimo do caput do art. 14 (C-0004-09, RN-TEAT-126)', () => {
  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;

  it('C-0004-09 — dado field_details_json sem os sete elementos então 422 TEAT.MEASURE_TERM_MINIMUM_CONTENT com context.missing', async () => {
    const dependencies = deps();
    await expect(
      issueTerm(
        dependencies,
        MEASURE_RETIDO,
        baseBody({
          term_type: 'removal',
          withdrawal_deadline_at: '2026-09-21T00:00:00-04:00',
          field_details_json: { agency: 'Fixture Órgão' },
        }),
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.MEASURE_TERM_MINIMUM_CONTENT',
      status: 422,
      context: expect.objectContaining({
        missing: expect.arrayContaining([
          'vehicle',
          'ait_or_order_ref',
          'place_datetime',
          'legal_basis',
          'custody_place',
          'owner_and_driver',
        ]),
      }),
    });
  });
});

describe('CTG-0004 §2/§4.5 — apply-term: ctb_deadline_at = computeDue(T-DEPOSITO6M) (C-0004-10)', () => {
  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;

  it('C-0004-10 — dado apply-term completo com issued_at=2026-09-14 então computeMeasureDue é chamado com T-DEPOSITO6M e a data de issued_at, e ctb_deadline_at é o valor devolvido', async () => {
    const dependencies = deps();
    const result = await issueTerm(
      dependencies,
      MEASURE_RETIDO,
      baseBody({
        term_type: 'removal',
        withdrawal_deadline_at: '2026-09-21T00:00:00-04:00',
        issued_at: '2026-09-14T09:00:00-04:00',
        field_details_json: FULL_FIELD_DETAILS,
      }),
    );
    expect(dependencies.deadlines.computeMeasureDue).toHaveBeenCalledWith(
      'T-DEPOSITO6M',
      '2026-09-14',
      TENANT_ID,
    );
    expect(result.ctb_deadline_at).toBe('2027-03-15');
  });
});
