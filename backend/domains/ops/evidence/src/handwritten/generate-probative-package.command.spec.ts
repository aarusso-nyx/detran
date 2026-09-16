import { describe, expect, it, vi } from 'vitest';

/**
 * CTG-0003 §4.6 e §10 (R-0008, TASK-0006) — C-0003-11: `POST
 * /v1/ops/evidence/probative-packages/generate`.
 * `handwritten/generate-probative-package.command.ts` nasce em TASK-0007.
 * Nome esperado do export: `GenerateProbativePackageCommand`, construtor
 * `(deps)`, método `execute`.
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
const AIT_ID = '00000000-0000-7000-8000-0000f0000002';

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    list: vi.fn(async () => [...store]),
    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    create: vi.fn(async (values: Record<string, unknown>) => {
      const row = { id: `row-${store.length + 1}`, ...values };
      store.push(row);
      return row;
    }),
    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
      const row = store.find((entry) => entry.id === id);
      if (row) Object.assign(row, patch);
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
      evidence: repository(),
      evidenceLinks: repository(),
      probativePackages: repository(),
      probativePackageItems: repository(),
      custodyEvents: repository(),
      ...(overrides.repositories ?? {}),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
  };
}

function input(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    traffic_agency_id: AGENCY_ID,
    entity_type: 'ait',
    entity_id: AIT_ID,
    generated_by_user_ref: ACTOR_ID,
    purpose: 'instrucao-processual',
    ...overrides,
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function generateProbativePackage(
  dependencies: Deps,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule(
      './generate-probative-package.command.js',
    )) as Record<string, unknown>;
  } catch (cause) {
    throw new Error(
      'ops/evidence/src/handwritten/generate-probative-package.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
      { cause },
    );
  }
  const exported =
    (loaded.GenerateProbativePackageCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'generate-probative-package.command.ts não exporta um comando construtível (CTG-0003 §11)',
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
      'generate-probative-package.command.ts não expõe execute|handle|run (CTG-0003 §4.6)',
    );
  }
  return (await (method as (value: unknown) => Promise<unknown>).call(
    command,
    body,
  )) as Record<string, unknown>;
}

describe('CTG-0003 §4.6 — probative-packages/generate: cobertura mínima (C-0003-11)', () => {
  it('C-0003-11 — dado probative-packages/generate para um AIT sem evidência validated|linked então 422 TEAT.PROBATIVE_PACKAGE_INCOMPLETE com { entityType, entityId, found: 0 }', async () => {
    const dependencies = deps();
    await expect(
      generateProbativePackage(dependencies, input()),
    ).rejects.toMatchObject({
      code: 'TEAT.PROBATIVE_PACKAGE_INCOMPLETE',
      status: 422,
      context: expect.objectContaining({
        entityType: 'ait',
        entityId: AIT_ID,
        found: 0,
      }),
    });
    expect(dependencies.repositories.probativePackages.rows).toEqual([]);
  });

  it('dado ao menos uma evidência validated ligada à entidade então o pacote é gerado com sucesso', async () => {
    const dependencies = deps({
      repositories: {
        evidence: repository([
          {
            id: '00000000-0000-7000-8000-0000ef000005',
            tenant_id: TENANT_ID,
            status: 'validated',
            hash_value: 'sha256:aaaa',
            evidence_type: 'foto',
            captured_at: '2026-09-10T10:00:00-04:00',
          },
        ]),
        evidenceLinks: repository([
          {
            id: 'link-1',
            tenant_id: TENANT_ID,
            evidence_id: '00000000-0000-7000-8000-0000ef000005',
            entity_type: 'ait',
            entity_id: AIT_ID,
          },
        ]),
        probativePackages: repository(),
        probativePackageItems: repository(),
        custodyEvents: repository(),
      },
    });
    const response = await generateProbativePackage(dependencies, input());
    expect(response.manifest_hash).toEqual(expect.stringMatching(/^sha256:/));
    expect(dependencies.repositories.probativePackageItems.rows).toHaveLength(
      1,
    );
  });
});
