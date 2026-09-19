import { describe, expect, it, vi } from 'vitest';

/**
 * CTG-0003 §2/§6.4 e §10 (R-0008, TASK-0006) — C-0003-25…26: `POST
 * /v1/inf/normative/mobile-packages/{id}/validate` (M13, [WF-TEAT-003]).
 * `handwritten/validate-package.command.ts` nasce em TASK-0007. Nome
 * esperado do export: `ValidatePackageCommand`, construtor `(deps)`, método
 * `execute`.
 *
 * Canônico (CTG-0003 §6.4): idempotente, **nunca** muda `status`;
 * `reason ∈ 'version_mismatch' | 'hash_mismatch' | 'not_published' | 'expired'`,
 * ordem de avaliação version → hash → status → valid_until.
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const PACKAGE_PUBLISHED = 'package-published-fixture';
const PACKAGE_DRAFT = 'package-draft-fixture';
const PACKAGE_EXPIRED = 'package-expired-fixture';

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
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
      packages: repository([
        {
          id: PACKAGE_PUBLISHED,
          tenant_id: TENANT_ID,
          status: 'published',
          package_version: '2026.1',
          manifest_hash: 'sha256:manifest-published',
          valid_until: null,
        },
        {
          id: PACKAGE_DRAFT,
          tenant_id: TENANT_ID,
          status: 'draft',
          package_version: '2026.2',
          manifest_hash: 'sha256:manifest-draft',
          valid_until: null,
        },
        {
          id: PACKAGE_EXPIRED,
          tenant_id: TENANT_ID,
          status: 'published',
          package_version: '2026.1',
          manifest_hash: 'sha256:manifest-expired',
          valid_until: '2026-01-01',
        },
      ]),
      ...(overrides.repositories ?? {}),
    },
    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function validatePackage(
  dependencies: Deps,
  id: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./validate-package.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/normative/src/handwritten/validate-package.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
      { cause },
    );
  }
  const exported =
    (loaded.ValidatePackageCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'validate-package.command.ts não exporta um comando construtível (CTG-0003 §11)',
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
      'validate-package.command.ts não expõe execute|handle|run (CTG-0003 §6.4)',
    );
  }
  return (await (method as (...values: unknown[]) => Promise<unknown>).call(
    command,
    id,
    body,
  )) as Record<string, unknown>;
}

describe('CTG-0003 §6.4 — mobile-packages/validate: idempotência e precedência dos motivos (C-0003-25…26)', () => {
  it('C-0003-25 — dado validate sobre um pacote published com hash e versão corretos então { valid:true, reason:null } e status inalterado; duas execuções dão a mesma resposta', async () => {
    const dependencies = deps();
    const body = {
      package_version: '2026.1',
      manifest_hash: 'sha256:manifest-published',
    };
    const first = await validatePackage(dependencies, PACKAGE_PUBLISHED, body);
    const second = await validatePackage(dependencies, PACKAGE_PUBLISHED, body);
    expect(first).toEqual({ valid: true, reason: null });
    expect(second).toEqual(first);
    expect(
      dependencies.repositories.packages.rows.find(
        (row) => row.id === PACKAGE_PUBLISHED,
      )?.status,
    ).toBe('published');
  });

  it('C-0003-26a — dado validate com versão errada então { valid:false, reason:"version_mismatch" }, sem exceção', async () => {
    const dependencies = deps();
    const response = await validatePackage(dependencies, PACKAGE_PUBLISHED, {
      package_version: '9999.9',
      manifest_hash: 'sha256:manifest-published',
    });
    expect(response).toEqual({ valid: false, reason: 'version_mismatch' });
  });

  it('C-0003-26b — dado validate com hash errado (versão correta) então { valid:false, reason:"hash_mismatch" }', async () => {
    const dependencies = deps();
    const response = await validatePackage(dependencies, PACKAGE_PUBLISHED, {
      package_version: '2026.1',
      manifest_hash: 'sha256:hash-errado',
    });
    expect(response).toEqual({ valid: false, reason: 'hash_mismatch' });
  });

  it('C-0003-26c — dado validate sobre draft (versão e hash corretos) então { valid:false, reason:"not_published" }', async () => {
    const dependencies = deps();
    const response = await validatePackage(dependencies, PACKAGE_DRAFT, {
      package_version: '2026.2',
      manifest_hash: 'sha256:manifest-draft',
    });
    expect(response).toEqual({ valid: false, reason: 'not_published' });
  });

  it('C-0003-26d — dado validate sobre publicado com valid_until no passado (versão e hash corretos) então { valid:false, reason:"expired" }', async () => {
    const dependencies = deps();
    const response = await validatePackage(dependencies, PACKAGE_EXPIRED, {
      package_version: '2026.1',
      manifest_hash: 'sha256:manifest-expired',
    });
    expect(response).toEqual({ valid: false, reason: 'expired' });
  });
});
