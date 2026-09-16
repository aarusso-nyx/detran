// CTG-0004 §1, §4.6 e §11 (R-0008, TASK-0008) — C-0004-01 (linha `release`).
// `handwritten/release-retention.command.ts` nasce em TASK-0009. O 403
// TEAT.MEASURE_RELEASE_NOT_ALLOWED (guarda de política) já está coberto por
// `backend/domains/shared/src/policy.spec.ts` (CTG-0004 §4 describe); este
// arquivo cobre só a guarda de estado do comando. Relógio fixo em 2026-09-14.
//
// Nome esperado do export: `ReleaseRetentionCommand`, construtor `(deps)`,
// método `execute(retentionId, dto)`.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const NOW = '2026-09-14T15:00:00.000Z';

/**
 * `release` opera sobre `measure_retention`, mas a matriz de C-0004-01 é
 * sobre o estado da MEDIDA (§1: "release / RETIDO, LIBERADO_COM_PRAZO / os
 * outros 10"). Uma retenção sintética por medida `…ed0000nn` (ids de teste,
 * não da fixture SQL — só a fixture `…ed100001` existe em
 * `28-fixtures-teat-measures-alcohol.sql`, presa à medida `…ed000003`;
 * rait-test-strategy.md §6 permite variação a partir da fixture com override
 * explícito, e aqui a variação é o próprio conjunto de estados da matriz).
 */
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

/** admitidos de `release` (CTG-0004 §1). */
const ALLOWED_STATES = ['RETIDO', 'LIBERADO_COM_PRAZO'];

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
    // `release` grava `measure_status_history` (§16.1) — a porta de
    // repositório precisa de `create` para não cair no atalho de SQL cru
    // (que exigiria uma `tx` real, ausente nos testes unit).
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

function fixtures() {
  const measures = repository(
    ALL_MEASURE_STATES.map(({ id, state }) => ({
      id,
      tenant_id: TENANT_ID,
      current_status: state,
      regularized_at: null,
    })),
  );
  const retentions = repository(
    ALL_MEASURE_STATES.map(({ id, state }, index) => ({
      id: `retention-${index + 1}`,
      tenant_id: TENANT_ID,
      measure_id: id,
      regularization_deadline_at: null,
      // §16.1: o ramo LIBERADO_COM_PRAZO → REGULARIZADO exige
      // regularized_at informado ou já gravado; a fixture genérica da
      // matriz de estados (C-0004-01) precisa desse campo para o único
      // pré-estado admitido em que ele é obrigatório.
      regularized_at:
        state === 'LIBERADO_COM_PRAZO' ? '2026-10-10T00:00:00-04:00' : null,
      released_at: null,
    })),
  );
  return { measures, retentions };
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
      ...fixtures(),
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

async function releaseRetention(
  dependencies: Deps,
  retentionId: string,
  body: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./release-retention.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/measures/src/handwritten/release-retention.command.ts ainda não existe (TASK-0009, CTG-0004 §4.6)',
      { cause },
    );
  }
  const exported =
    (loaded.ReleaseRetentionCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'release-retention.command.ts não exporta um comando construtível (CTG-0004 §4.6)',
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
      'release-retention.command.ts não expõe execute|handle|run (CTG-0004 §4.6)',
    );
  }
  return (await (
    method as (id: string, body: unknown) => Promise<unknown>
  ).call(command, retentionId, body)) as Record<string, unknown>;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CTG-0004 §1/§4.6 — release: matriz de estados da medida (C-0004-01, linha `release`)', () => {
  ALL_MEASURE_STATES.forEach(({ id, state }, index) => {
    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
    const retentionId = `retention-${index + 1}`;
    it(`dada medida ${id} em ${state} quando release da retenção ${retentionId} então ${admitted ? 'sucesso' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
      const dependencies = deps();
      if (admitted) {
        await expect(
          releaseRetention(dependencies, retentionId),
        ).resolves.toMatchObject({ measure_id: id });
      } else {
        await expect(
          releaseRetention(dependencies, retentionId),
        ).rejects.toMatchObject({
          code: 'TEAT.MEASURE_STATE_INVALID',
          status: 409,
          context: expect.objectContaining({
            measureId: id,
            currentState: state,
            allowed: ALLOWED_STATES,
            command: 'release',
          }),
        });
      }
    });
  });
});

describe('CTG-0004 §4.6 — release: retenção já liberada (pré-condição do contrato)', () => {
  it('dado uma retenção com released_at já gravado então 409 TEAT.MEASURE_STATE_INVALID com { retentionId, currentState: "released" }', async () => {
    const { measures } = fixtures();
    const retentions = repository([
      {
        id: 'retention-released',
        tenant_id: TENANT_ID,
        measure_id: ALL_MEASURE_STATES[0].id,
        regularization_deadline_at: null,
        released_at: '2026-09-01T00:00:00-04:00',
      },
    ]);
    const dependencies = deps({
      repositories: { measures, retentions, history: repository() },
    });
    await expect(
      releaseRetention(dependencies, 'retention-released'),
    ).rejects.toMatchObject({
      code: 'TEAT.MEASURE_STATE_INVALID',
      status: 409,
      context: expect.objectContaining({
        retentionId: 'retention-released',
        currentState: 'released',
      }),
    });
  });

  // §16.1 (adenda do maestro, delivery-review ciclo 1, OD do achado 1):
  // `release` só tem dois ramos de destino, pelo pré-estado da medida — de
  // `RETIDO` sempre para `LIBERADO_LOCAL` (a presença de
  // `regularization_deadline_at` na retenção não muda o destino: essa
  // leitura antiga do §4.6 foi substituída), e de `LIBERADO_COM_PRAZO` com
  // `regularized_at` informado (no corpo) ou já gravado (na retenção) para
  // `REGULARIZADO`. Os dois ramos gravam `inf.measure_status_history` na
  // mesma transação e publicam `measure.changed`.
  it('§16.1 — dada medida RETIDO (mesmo com regularization_deadline_at preenchida na retenção) quando release então current_status vai a LIBERADO_LOCAL, com measure_status_history e measure.changed na mesma transação', async () => {
    const { measures } = fixtures();
    const history = repository();
    const outbox = { append: vi.fn(async () => ({ id: 'outbox-row-1' })) };
    const retentions = repository([
      {
        id: 'retention-with-deadline',
        tenant_id: TENANT_ID,
        measure_id: ALL_MEASURE_STATES[0].id,
        regularization_deadline_at: '2026-10-14T00:00:00-04:00',
        regularized_at: null,
        released_at: null,
      },
    ]);
    const dependencies = deps({
      repositories: { measures, retentions, history },
      outbox,
    });
    const result = await releaseRetention(
      dependencies,
      'retention-with-deadline',
    );
    expect(result.current_status).toBe('LIBERADO_LOCAL');
    expect(
      history.rows.some(
        (row) =>
          row.measure_id === ALL_MEASURE_STATES[0].id &&
          row.status === 'LIBERADO_LOCAL',
      ),
    ).toBe(true);
    expect(outbox.append).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'measure.changed',
        aggregate: expect.objectContaining({
          kind: 'administrative-measure',
          id: ALL_MEASURE_STATES[0].id,
        }),
      }),
    );
  });

  it('§16.1 — dada medida LIBERADO_COM_PRAZO com regularized_at já gravado na retenção quando release então current_status vai a REGULARIZADO, com measure_status_history e measure.changed na mesma transação', async () => {
    const measureId = ALL_MEASURE_STATES.find(
      (entry) => entry.state === 'LIBERADO_COM_PRAZO',
    )!.id;
    const { measures } = fixtures();
    const history = repository();
    const outbox = { append: vi.fn(async () => ({ id: 'outbox-row-1' })) };
    const retentions = repository([
      {
        id: 'retention-regularized',
        tenant_id: TENANT_ID,
        measure_id: measureId,
        regularization_deadline_at: '2026-10-14T00:00:00-04:00',
        regularized_at: '2026-10-10T00:00:00-04:00',
        released_at: null,
      },
    ]);
    const dependencies = deps({
      repositories: { measures, retentions, history },
      outbox,
    });
    const result = await releaseRetention(
      dependencies,
      'retention-regularized',
    );
    expect(result.current_status).toBe('REGULARIZADO');
    expect(
      history.rows.some(
        (row) => row.measure_id === measureId && row.status === 'REGULARIZADO',
      ),
    ).toBe(true);
    expect(outbox.append).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'measure.changed',
        aggregate: expect.objectContaining({
          kind: 'administrative-measure',
          id: measureId,
        }),
      }),
    );
  });

  it('§16.1 — dada medida LIBERADO_COM_PRAZO com regularized_at informado no corpo (retenção sem o campo gravado) quando release então current_status vai a REGULARIZADO', async () => {
    const measureId = ALL_MEASURE_STATES.find(
      (entry) => entry.state === 'LIBERADO_COM_PRAZO',
    )!.id;
    const { measures } = fixtures();
    const retentions = repository([
      {
        id: 'retention-regularized-by-body',
        tenant_id: TENANT_ID,
        measure_id: measureId,
        regularization_deadline_at: '2026-10-14T00:00:00-04:00',
        regularized_at: null,
        released_at: null,
      },
    ]);
    const dependencies = deps({
      repositories: { measures, retentions, history: repository() },
    });
    const result = await releaseRetention(
      dependencies,
      'retention-regularized-by-body',
      { regularized_at: '2026-10-10T00:00:00-04:00' },
    );
    expect(result.current_status).toBe('REGULARIZADO');
  });
});
