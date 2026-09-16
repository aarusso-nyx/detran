import { describe, expect, it, vi } from 'vitest';

/**
 * CTG-0003 §4.5 e §10 (R-0008, TASK-0006) — C-0003-10: `POST
 * /v1/ops/evidence/{id}/custody-events`. `handwritten/add-custody-event.command.ts`
 * nasce em TASK-0007. Nome esperado do export: `AddCustodyEventCommand`,
 * construtor `(deps)`, método `execute`.
 *
 * Canônico (CTG-0003 §11.8): o vocabulário de `event_type` desta rodada tem
 * onze tokens — `uploaded`, `validated`, `rejected`, `linked`, `packaged`,
 * `access_approved`, `access_denied`, `access_delivered`,
 * `purged_unverified`, `quarantined`, `restored` — sem check na coluna; é
 * vocabulário de modelagem, não token canônico de workflow.
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const EVIDENCE_ID = '00000000-0000-7000-8000-0000ef000001';

const CUSTODY_EVENT_TYPES = [
  'uploaded',
  'validated',
  'rejected',
  'linked',
  'packaged',
  'access_approved',
  'access_denied',
  'access_delivered',
  'purged_unverified',
  'quarantined',
  'restored',
] as const;

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
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

function deps(overrides: Partial<Deps> = {}): Deps {
  return {
    database: overrides.database ?? {
      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
        return work({ query: vi.fn(async () => ({ rows: [] })) });
      },
    },
    requestContext: overrides.requestContext ?? {
      hasActiveContext: () => true,
      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
    },
    repositories: {
      evidence: repository([
        { id: EVIDENCE_ID, tenant_id: TENANT_ID, status: 'validated' },
      ]),
      custodyEvents: repository(),
      ...(overrides.repositories ?? {}),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function addCustodyEvent(
  dependencies: Deps,
  evidenceId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./add-custody-event.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'ops/evidence/src/handwritten/add-custody-event.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
      { cause },
    );
  }
  const exported =
    (loaded.AddCustodyEventCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'add-custody-event.command.ts não exporta um comando construtível (CTG-0003 §11)',
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
      'add-custody-event.command.ts não expõe execute|handle|run (CTG-0003 §4.5)',
    );
  }
  return (await (
    method as (id: string, value: unknown) => Promise<unknown>
  ).call(command, evidenceId, body)) as Record<string, unknown>;
}

describe('CTG-0003 §4.5 — custody-events: vocabulário de event_type (C-0003-10)', () => {
  it('C-0003-10 — dado custody-events com event_type=foo então 422 TEAT.ENUM_INVALID com context.allowed contendo os onze tokens', async () => {
    const dependencies = deps();
    await expect(
      addCustodyEvent(dependencies, EVIDENCE_ID, { event_type: 'foo' }),
    ).rejects.toMatchObject({
      code: 'TEAT.ENUM_INVALID',
      status: 422,
      context: expect.objectContaining({
        field: 'event_type',
        allowed: expect.arrayContaining([...CUSTODY_EVENT_TYPES]),
      }),
    });
  });

  it.each(CUSTODY_EVENT_TYPES)(
    'dado event_type=%s (vocabulário admitido) então o evento é registrado sem exceção',
    async (eventType) => {
      const dependencies = deps();
      const response = await addCustodyEvent(dependencies, EVIDENCE_ID, {
        event_type: eventType,
      });
      expect(response.event_type).toBe(eventType);
      expect(dependencies.repositories.custodyEvents.rows).toHaveLength(1);
    },
  );
});
