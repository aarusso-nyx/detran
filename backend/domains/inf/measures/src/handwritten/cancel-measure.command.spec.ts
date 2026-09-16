// CTG-0004 §1, §4.7, §11 e §14 item 2 (R-0008, TASK-0008) — C-0004-01 (linha
// `cancel`) e C-0004-12 (OD-T37): [WF-TEAT-004] não tem estado de
// cancelamento; a rota responde sempre 409 TEAT.MEASURE_STATE_INVALID com
// `allowed: []`, comportamento já implementado em
// `measure-lifecycle.service.ts` hoje (`cancel` rejeita sempre) — este
// arquivo prova o novo formato de erro (`DetranError`/`context`) que
// TASK-0009 precisa produzir. Relógio fixo em 2026-09-14.
//
// Nome esperado do export: `CancelMeasureCommand`, construtor `(deps)`,
// método `execute(measureId, dto)`.
import { describe, expect, it, vi } from 'vitest';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';

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

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    update: vi.fn(),
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

function deps(): Deps {
  return {
    database: {
      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
        return work({});
      },
    },
    requestContext: {
      hasActiveContext: () => true,
      snapshot: () => ({
        tenantId: TENANT_ID,
        actorId: '00000000-0000-4000-8000-0000b0000001',
      }),
    },
    repositories: {
      measures: repository(
        ALL_MEASURE_STATES.map(({ id, state }) => ({
          id,
          tenant_id: TENANT_ID,
          current_status: state,
        })),
      ),
      history: repository(),
    },
    outbox: { append: vi.fn(async () => ({ id: 'outbox-row-1' })) },
    clock: { now: () => '2026-09-14T15:00:00.000Z' },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function cancelMeasure(
  dependencies: Deps,
  measureId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./cancel-measure.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/measures/src/handwritten/cancel-measure.command.ts ainda não existe (TASK-0009, CTG-0004 §4.7)',
      { cause },
    );
  }
  const exported =
    (loaded.CancelMeasureCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'cancel-measure.command.ts não exporta um comando construtível (CTG-0004 §4.7)',
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
      'cancel-measure.command.ts não expõe execute|handle|run (CTG-0004 §4.7)',
    );
  }
  return (await (
    method as (id: string, body: unknown) => Promise<unknown>
  ).call(command, measureId, body)) as Record<string, unknown>;
}

describe('CTG-0004 §1/§4.7 — cancel: matriz de estados (C-0004-01, linha `cancel`) e C-0004-12 (OD-T37)', () => {
  for (const { id, state } of ALL_MEASURE_STATES) {
    it(`C-0004-12 — dada medida ${id} em ${state} quando cancel então sempre 409 TEAT.MEASURE_STATE_INVALID com allowed: []`, async () => {
      const dependencies = deps();
      await expect(
        cancelMeasure(dependencies, id, {
          reason: 'Fixture — pedido de teste',
        }),
      ).rejects.toMatchObject({
        code: 'TEAT.MEASURE_STATE_INVALID',
        status: 409,
        context: expect.objectContaining({
          measureId: id,
          currentState: state,
          allowed: [],
          command: 'cancel',
        }),
      });
      expect(dependencies.repositories.measures.update).not.toHaveBeenCalled();
    });
  }
});
