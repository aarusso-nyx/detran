// CTG-0004 §3, §3.1, §5.2 e §11 (R-0008, TASK-0008) — C-0004-13 (linha
// `record-test`), C-0004-14, C-0004-15, C-0004-16, C-0004-17, C-0004-18 e
// C-0004-19. `handwritten/record-test.command.ts` nasce em TASK-0009.
// Fixtures: `28-fixtures-teat-measures-alcohol.sql` (`…ea000001` etilômetro
// vigente até 2027-06-30, `…ea000002` vencido em 2025-12-31;
// `…eb000001` tabela metrológica ativa, `table_json.thresholds` = {
// administrative: 0.05, crime: 0.34 } (normativo, RN-TEAT-133) e
// `table_json.tolerance` = [{0.00–0.40: max_error 0.04}, {0.40–∞: max_error
// 0.05}] — SOURCE_PENDING (Anexo I da Res. 432 não capturado); os testes
// abaixo leem `max_error` **da fixture**, nunca de constante própria
// (regra do prompt, item 17). Relógio fixo em 2026-09-14.
//
// Nome esperado do export: `RecordTestCommand`, construtor `(deps)`, método
// `execute(procedureId, dto)`.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const BREATHALYZER_VALID = '00000000-0000-7000-8000-0000ea000001';
const BREATHALYZER_EXPIRED = '00000000-0000-7000-8000-0000ea000002';
const METROLOGICAL_TABLE_ACTIVE = '00000000-0000-7000-8000-0000eb000001';
const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';
const NOW = '2026-09-14T15:00:00.000Z';

/** `table_json` real de `28-fixtures-teat-measures-alcohol.sql` (CTG-0004 §3.1). */
const TABLE_JSON = {
  unit: 'mg/L',
  thresholds: { administrative: 0.05, crime: 0.34 },
  tolerance: [
    { from: 0.0, to: 0.4, max_error: 0.04 },
    { from: 0.4, to: null, max_error: 0.05 },
  ],
};

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

/** admitidos de `record-test` (CTG-0004 §3). */
const ALLOWED_STATES = ['TRIAGEM', 'ETILOMETRO_OFERECIDO'];

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
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
    list: vi.fn(async () => store),
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
      tests: repository(),
      breathalyzers: repository([
        {
          id: BREATHALYZER_VALID,
          tenant_id: TENANT_ID,
          calibration_valid_until: '2027-06-30',
          status: 'active',
        },
        {
          id: BREATHALYZER_EXPIRED,
          tenant_id: TENANT_ID,
          calibration_valid_until: '2025-12-31',
          status: 'active',
        },
      ]),
      metrologicalTables: repository([
        {
          id: METROLOGICAL_TABLE_ACTIVE,
          tenant_id: TENANT_ID,
          catalog_id: CATALOG_ACTIVE,
          status: 'active',
          table_json: TABLE_JSON,
        },
      ]),
      catalogs: repository([
        {
          id: CATALOG_ACTIVE,
          tenant_id: TENANT_ID,
          status: 'active',
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

async function recordTest(
  dependencies: Deps,
  procedureId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./record-test.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/alcohol/src/handwritten/record-test.command.ts ainda não existe (TASK-0009, CTG-0004 §5.2)',
      { cause },
    );
  }
  const exported =
    (loaded.RecordTestCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'record-test.command.ts não exporta um comando construtível (CTG-0004 §5.2)',
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
      'record-test.command.ts não expõe execute|handle|run (CTG-0004 §5.2)',
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

const VALID_BODY = {
  breathalyzer_id: BREATHALYZER_VALID,
  result_mg_l: 0.3,
  tested_at: '2026-09-14T10:00:00-04:00',
};

describe('CTG-0004 §3/§5.2 — record-test: matriz de estados (C-0004-13, linha `record-test`)', () => {
  for (const { id, state } of ALL_PROCEDURE_STATES) {
    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
    it(`dado procedimento ${id} em ${state} quando record-test então ${admitted ? 'sucesso' : '409 TEAT.ALCOHOL_STATE_INVALID'}`, async () => {
      const dependencies = deps();
      if (admitted) {
        await expect(
          recordTest(dependencies, id, VALID_BODY),
        ).resolves.toMatchObject({ procedure_id: id });
      } else {
        await expect(
          recordTest(dependencies, id, VALID_BODY),
        ).rejects.toMatchObject({
          code: 'TEAT.ALCOHOL_STATE_INVALID',
          status: 409,
          context: expect.objectContaining({
            procedureId: id,
            currentState: state,
            allowed: ALLOWED_STATES,
            command: 'record-test',
          }),
        });
      }
    });
  }
});

describe('CTG-0004 §5.2 — record-test: guarda metrológica (C-0004-14, C-0004-15, C-0004-16)', () => {
  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
    (entry) => entry.state === 'TRIAGEM',
  )!.id;

  it('C-0004-14 — dado o etilômetro …ea000002 (verificação vencida) então 422 TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED com { breathalyzerId, calibrationValidUntil, testedAt }', async () => {
    const dependencies = deps();
    await expect(
      recordTest(dependencies, PROCEDURE_TRIAGEM, {
        ...VALID_BODY,
        breathalyzer_id: BREATHALYZER_EXPIRED,
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED',
      status: 422,
      context: expect.objectContaining({
        breathalyzerId: BREATHALYZER_EXPIRED,
        calibrationValidUntil: expect.any(String),
        testedAt: expect.any(String),
      }),
    });
  });

  it('C-0004-15 — dado nenhuma normative_metrological_table status=active então 422 TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING', async () => {
    const dependencies = deps({
      repositories: {
        procedures: proceduresRepo(),
        tests: repository(),
        breathalyzers: repository([
          {
            id: BREATHALYZER_VALID,
            tenant_id: TENANT_ID,
            calibration_valid_until: '2027-06-30',
            status: 'active',
          },
        ]),
        metrologicalTables: repository([]),
        catalogs: repository([
          { id: CATALOG_ACTIVE, tenant_id: TENANT_ID, status: 'active' },
        ]),
      },
    });
    await expect(
      recordTest(dependencies, PROCEDURE_TRIAGEM, VALID_BODY),
    ).rejects.toMatchObject({
      code: 'TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING',
      status: 422,
    });
  });

  // §16.4 (adenda do maestro, delivery-review ciclo 1, achado 4): a tabela
  // usada precisa ter status='active' **e** pertencer a um
  // normative_catalog com status='active' do tenant. Positivo (tabela e
  // catálogo ativos) já é coberto pelos demais casos deste describe (usam
  // `deps()` default); o negativo abaixo cobre tabela ativa de catálogo
  // retired/draft.
  it('§16.4 — dado tabela status=active mas normative_catalog status=active positivo (baseline explícito) então record-test é aceito', async () => {
    const dependencies = deps();
    await expect(
      recordTest(dependencies, PROCEDURE_TRIAGEM, VALID_BODY),
    ).resolves.toMatchObject({ procedure_id: PROCEDURE_TRIAGEM });
  });

  it('§16.4 — dado tabela status=active de um normative_catalog status=retired então 422 TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING com { catalogId }', async () => {
    const dependencies = deps({
      repositories: {
        procedures: proceduresRepo(),
        tests: repository(),
        breathalyzers: repository([
          {
            id: BREATHALYZER_VALID,
            tenant_id: TENANT_ID,
            calibration_valid_until: '2027-06-30',
            status: 'active',
          },
        ]),
        metrologicalTables: repository([
          {
            id: METROLOGICAL_TABLE_ACTIVE,
            tenant_id: TENANT_ID,
            catalog_id: CATALOG_ACTIVE,
            status: 'active',
            table_json: TABLE_JSON,
          },
        ]),
        catalogs: repository([
          { id: CATALOG_ACTIVE, tenant_id: TENANT_ID, status: 'retired' },
        ]),
      },
    });
    await expect(
      recordTest(dependencies, PROCEDURE_TRIAGEM, VALID_BODY),
    ).rejects.toMatchObject({
      code: 'TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING',
      status: 422,
      context: expect.objectContaining({ catalogId: CATALOG_ACTIVE }),
    });
  });

  it('§16.4 — dado tabela status=active de um normative_catalog status=draft então 422 TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING', async () => {
    const dependencies = deps({
      repositories: {
        procedures: proceduresRepo(),
        tests: repository(),
        breathalyzers: repository([
          {
            id: BREATHALYZER_VALID,
            tenant_id: TENANT_ID,
            calibration_valid_until: '2027-06-30',
            status: 'active',
          },
        ]),
        metrologicalTables: repository([
          {
            id: METROLOGICAL_TABLE_ACTIVE,
            tenant_id: TENANT_ID,
            catalog_id: CATALOG_ACTIVE,
            status: 'active',
            table_json: TABLE_JSON,
          },
        ]),
        catalogs: repository([
          { id: CATALOG_ACTIVE, tenant_id: TENANT_ID, status: 'draft' },
        ]),
      },
    });
    await expect(
      recordTest(dependencies, PROCEDURE_TRIAGEM, VALID_BODY),
    ).rejects.toMatchObject({
      code: 'TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING',
      status: 422,
    });
  });

  it('C-0004-16 — dado result_mg_l ausente então 400 TEAT.ALCOHOL_RESULT_PAIR_REQUIRED', async () => {
    const dependencies = deps();
    const body = { ...VALID_BODY } as Record<string, unknown>;
    delete body.result_mg_l;
    await expect(
      recordTest(dependencies, PROCEDURE_TRIAGEM, body),
    ).rejects.toMatchObject({
      code: 'TEAT.ALCOHOL_RESULT_PAIR_REQUIRED',
      status: 400,
    });
  });
});

describe('CTG-0004 §3.1/§5.2 — record-test: max_error da fixture e considered_mg_l (C-0004-17, C-0004-19)', () => {
  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
    (entry) => entry.state === 'TRIAGEM',
  )!.id;

  it('C-0004-17 — dado result_mg_l=0.30 então considered_mg_l = 0.30 − max_error da faixa [0.00,0.40) da fixture (0.04) = 0.26, e o estado final é RESULTADO_ADMINISTRATIVO', async () => {
    const dependencies = deps();
    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
      ...VALID_BODY,
      result_mg_l: 0.3,
    });
    expect(result.max_error_mg_l).toBeCloseTo(0.04, 5);
    expect(result.considered_mg_l).toBeCloseTo(0.26, 5);
    expect(result.procedure_status).toBe('RESULTADO_ADMINISTRATIVO');
  });

  it('C-0004-19 — dado result_mg_l=0.02 (< max_error da faixa) então considered_mg_l = max(0, 0.02 − 0.04) = 0, nunca negativo', async () => {
    const dependencies = deps();
    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
      ...VALID_BODY,
      result_mg_l: 0.02,
    });
    expect(result.considered_mg_l).toBe(0);
    expect(result.procedure_status).toBe('RESULTADO_ABAIXO_LIMITE');
  });
});

describe('CTG-0004 §3.1/§5.2 — record-test: classificação pelos limiares da tabela (C-0004-18, WF-TEAT-005 §Limiares)', () => {
  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
    (entry) => entry.state === 'TRIAGEM',
  )!.id;

  it('dado considered < thresholds.administrative (0,05) então RESULTADO_ABAIXO_LIMITE', async () => {
    const dependencies = deps();
    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
      ...VALID_BODY,
      result_mg_l: 0.03,
    });
    expect(result.procedure_status).toBe('RESULTADO_ABAIXO_LIMITE');
  });

  it('dado thresholds.administrative <= considered < thresholds.crime então RESULTADO_ADMINISTRATIVO', async () => {
    const dependencies = deps();
    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
      ...VALID_BODY,
      result_mg_l: 0.3,
    });
    expect(result.procedure_status).toBe('RESULTADO_ADMINISTRATIVO');
  });

  it('dado considered >= thresholds.crime (0,34) então RESULTADO_CRIME', async () => {
    const dependencies = deps();
    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
      ...VALID_BODY,
      result_mg_l: 0.5,
    });
    expect(result.max_error_mg_l).toBeCloseTo(0.05, 5);
    expect(result.considered_mg_l).toBeCloseTo(0.45, 5);
    expect(result.procedure_status).toBe('RESULTADO_CRIME');
  });
});

describe('CTG-0004 §5.2 — record-test: evento ALCOOLEMIA_TESTE_REGISTRADO', () => {
  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
    (entry) => entry.state === 'TRIAGEM',
  )!.id;

  it('dado record-test então alcohol.changed/ALCOOLEMIA_TESTE_REGISTRADO é publicado com resultMgL, maxErrorMgL e consideredMgL', async () => {
    const dependencies = deps();
    await recordTest(dependencies, PROCEDURE_TRIAGEM, VALID_BODY);
    expect(dependencies.outbox.append).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'alcohol.changed',
        domainEvent: 'ALCOOLEMIA_TESTE_REGISTRADO',
        aggregate: expect.objectContaining({
          kind: 'alcohol-procedure',
          id: PROCEDURE_TRIAGEM,
        }),
        data: expect.objectContaining({
          procedureId: PROCEDURE_TRIAGEM,
          resultMgL: 0.3,
          maxErrorMgL: expect.any(Number),
          consideredMgL: expect.any(Number),
        }),
      }),
    );
  });
});
