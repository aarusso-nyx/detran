import { describe, expect, it, vi } from 'vitest';

/**
 * CTG-0003 §4.3 e §10 (R-0008, TASK-0006) — C-0003-09 e a fração de
 * `validate` de C-0003-08: `POST /v1/ops/evidence/{id}/validate` (M11).
 * `handwritten/validate-evidence.command.ts` nasce em TASK-0007. Nome
 * esperado do export: `ValidateEvidenceCommand`, construtor `(deps)`, método
 * `execute`.
 *
 * Canônico: o conjunto persistido `ck_ops_evidence_status` do blueprint
 * **não tem** o token `invalid` — só `rejected` (CTG-0003 §13 item 6, OD-T33).
 * `decision='invalid'` grava `status='rejected'`, nunca inventa um token novo.
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const EVIDENCE_UPLOADED = '00000000-0000-7000-8000-0000ef000003';
const EVIDENCE_QUARANTINED = '00000000-0000-7000-8000-0000ef000004';

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
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
        {
          id: EVIDENCE_UPLOADED,
          tenant_id: TENANT_ID,
          status: 'uploaded',
        },
        {
          id: EVIDENCE_QUARANTINED,
          tenant_id: TENANT_ID,
          status: 'quarantined',
        },
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

async function validateEvidence(
  dependencies: Deps,
  evidenceId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./validate-evidence.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'ops/evidence/src/handwritten/validate-evidence.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
      { cause },
    );
  }
  const exported =
    (loaded.ValidateEvidenceCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'validate-evidence.command.ts não exporta um comando construtível (CTG-0003 §11)',
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
      'validate-evidence.command.ts não expõe execute|handle|run (CTG-0003 §4.3)',
    );
  }
  return (await (
    method as (id: string, value: unknown) => Promise<unknown>
  ).call(command, evidenceId, body)) as Record<string, unknown>;
}

describe('CTG-0003 §4.3 — validate: decisão e quarentena (C-0003-08b, C-0003-09)', () => {
  it('C-0003-08b — dada a evidência …ef000004 (quarantined) quando validate então 409 TEAT.EVIDENCE_QUARANTINED, e esse código precede a guarda de estado (uploaded esperado)', async () => {
    const dependencies = deps();
    await expect(
      validateEvidence(dependencies, EVIDENCE_QUARANTINED, {
        decision: 'valid',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.EVIDENCE_QUARANTINED',
      status: 409,
    });
  });

  it('C-0003-09 — dado validate com decision=invalid então status=rejected — nunca um token invalid, que não existe no check do blueprint', async () => {
    const dependencies = deps();
    const response = await validateEvidence(dependencies, EVIDENCE_UPLOADED, {
      decision: 'invalid',
      reason: 'hash não confere com o laudo pericial',
    });
    expect(response.status).toBe('rejected');
    expect(response.status).not.toBe('invalid');
    expect(
      dependencies.repositories.evidence.rows.find(
        (row) => row.id === EVIDENCE_UPLOADED,
      )?.status,
    ).toBe('rejected');
  });

  it('dado validate com decision=valid (default) então status=validated', async () => {
    const dependencies = deps();
    const response = await validateEvidence(
      dependencies,
      EVIDENCE_UPLOADED,
      {},
    );
    expect(response.status).toBe('validated');
  });
});
