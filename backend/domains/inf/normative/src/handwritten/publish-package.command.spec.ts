import { describe, expect, it, vi } from 'vitest';

/**
 * CTG-0003 §2/§6.3 e §10 (R-0008, TASK-0006) — C-0003-23…24: `POST
 * /v1/inf/normative/mobile-packages/{id}/publish` e `.../retire` (M13).
 * `handwritten/publish-package.command.ts` nasce em TASK-0007 (CTG-0003
 * §11). Nome esperado do export: `PublishPackageCommand`, construtor
 * `(deps)`, métodos `publish` e `retire`.
 *
 * Fixtures: `normative_mobile_package` `…e7000001` (`published`, catálogo
 * `…e0000001` ativo) e `…e7000002` (`draft`, `27-fixtures-teat-evidence.sql`).
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';
const PACKAGE_DRAFT = '00000000-0000-7000-8000-0000e7000002';
const PACKAGE_RETIRED = 'package-retired-fixture';

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
  };
}

interface Deps {
  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
  requestContext: {
    hasActiveContext(): boolean;
    snapshot(): { tenantId: string; actorId: string };
  };
  repositories: Record<string, ReturnType<typeof repository>>;
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
      snapshot: () => ({
        tenantId: TENANT_ID,
        actorId: '00000000-0000-4000-8000-0000b0000001',
      }),
    },
    repositories: {
      catalogs: repository([
        { id: CATALOG_ACTIVE, tenant_id: TENANT_ID, status: 'active' },
      ]),
      packages: repository([
        {
          id: PACKAGE_DRAFT,
          tenant_id: TENANT_ID,
          catalog_id: CATALOG_ACTIVE,
          status: 'draft',
          manifest_hash: 'sha256:draft-manifest-hash',
        },
        {
          id: PACKAGE_RETIRED,
          tenant_id: TENANT_ID,
          catalog_id: CATALOG_ACTIVE,
          status: 'retired',
          manifest_hash: 'sha256:retired-manifest-hash',
        },
      ]),
      ...(overrides.repositories ?? {}),
    },
    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function loadCommand(
  dependencies: Deps,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./publish-package.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/normative/src/handwritten/publish-package.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
      { cause },
    );
  }
  const exported =
    (loaded.PublishPackageCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'publish-package.command.ts não exporta um comando construtível (CTG-0003 §11)',
    );
  }
  const Command = exported as new (
    dependencies: unknown,
  ) => Record<string, unknown>;
  return new Command(dependencies);
}

async function publish(
  dependencies: Deps,
  id: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const command = await loadCommand(dependencies);
  const method = ['publish', 'execute', 'handle']
    .map((name) => command[name])
    .find((value) => typeof value === 'function');
  if (typeof method !== 'function') {
    throw new Error(
      'publish-package.command.ts não expõe publish|execute|handle',
    );
  }
  return (await (method as (...values: unknown[]) => Promise<unknown>).call(
    command,
    id,
    body,
  )) as Record<string, unknown>;
}

async function retire(
  dependencies: Deps,
  id: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const command = await loadCommand(dependencies);
  const method = ['retire']
    .map((name) => command[name])
    .find((value) => typeof value === 'function');
  if (typeof method !== 'function') {
    throw new Error('publish-package.command.ts não expõe retire');
  }
  return (await (method as (...values: unknown[]) => Promise<unknown>).call(
    command,
    id,
    body,
  )) as Record<string, unknown>;
}

describe('CTG-0003 §6.3 — mobile-packages publish/retire: manifesto divergente e estado (C-0003-23…24)', () => {
  it('C-0003-23 — dado publish com manifest_hash divergente então 422 TEAT.PACKAGE_MANIFEST_MISMATCH com { expected, received }', async () => {
    const dependencies = deps();
    await expect(
      publish(dependencies, PACKAGE_DRAFT, {
        manifest_hash: 'sha256:corpo-divergente',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.PACKAGE_MANIFEST_MISMATCH',
      status: 422,
      context: expect.objectContaining({
        packageId: PACKAGE_DRAFT,
        expected: 'sha256:draft-manifest-hash',
        received: 'sha256:corpo-divergente',
      }),
    });
  });

  it('C-0003-24a — dado um pacote retired quando publish então 409 TEAT.PACKAGE_STATE_INVALID com allowed:[draft,published]', async () => {
    const dependencies = deps();
    await expect(
      publish(dependencies, PACKAGE_RETIRED, {}),
    ).rejects.toMatchObject({
      code: 'TEAT.PACKAGE_STATE_INVALID',
      status: 409,
      context: expect.objectContaining({
        packageId: PACKAGE_RETIRED,
        currentState: 'retired',
        allowed: ['draft', 'published'],
      }),
    });
  });

  it('C-0003-24b — dado um pacote retired quando retire então 409 TEAT.PACKAGE_STATE_INVALID com allowed:[published]', async () => {
    const dependencies = deps();
    await expect(
      retire(dependencies, PACKAGE_RETIRED, {}),
    ).rejects.toMatchObject({
      code: 'TEAT.PACKAGE_STATE_INVALID',
      status: 409,
      context: expect.objectContaining({
        packageId: PACKAGE_RETIRED,
        currentState: 'retired',
        allowed: ['published'],
      }),
    });
  });

  it('dado publish sem manifest_hash informado então sucede a partir de draft', async () => {
    const dependencies = deps();
    const response = await publish(dependencies, PACKAGE_DRAFT, {});
    expect(response.status).toBe('published');
  });
});
