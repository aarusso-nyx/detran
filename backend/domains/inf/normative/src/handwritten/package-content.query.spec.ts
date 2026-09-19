import { describe, expect, it, vi } from 'vitest';

/**
 * CTG-0003 §3/§6.5 e §10 (R-0008, TASK-0006) — C-0003-27…28: `GET
 * /v1/inf/normative/mobile-packages/{id}/content` (M13, ADR-0018).
 * `handwritten/package-content.query.ts` nasce em TASK-0007. Nome esperado
 * do export: `PackageContentQuery`, construtor `(deps)`, método `execute`.
 *
 * Canônico (CTG-0003 §3): assinatura local via `PackageSignerPort` — app e
 * perfil local usam `LocalPackageSigner`: `signature.kind='local-unsigned'`,
 * `signature.signer='detran-backend-local'` (OD-T16 permanece aberta: o
 * substrato de selo real é `source_pending`). `ETag` da resposta é o
 * `manifest_hash`.
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';
const PACKAGE_PUBLISHED = 'package-published-fixture';

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    listWhere: vi.fn(
      async (predicate: (row: Record<string, unknown>) => boolean) =>
        store.filter(predicate),
    ),
  };
}

interface Deps {
  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
  requestContext: {
    hasActiveContext(): boolean;
    snapshot(): { tenantId: string; actorId: string };
  };
  repositories: Record<string, ReturnType<typeof repository>>;
  packageSigner: { sign: ReturnType<typeof vi.fn> };
  clock: { now(): string };
}

function catalogRepositories(manifestHash: string) {
  return {
    catalogs: repository([
      { id: CATALOG_ACTIVE, tenant_id: TENANT_ID, status: 'active' },
    ]),
    framings: repository([
      { id: 'framing-1', catalog_id: CATALOG_ACTIVE, status: 'active' },
    ]),
    metrologicalTables: repository(),
    validationRules: repository(),
    documentTemplates: repository(),
    agencyParameters: repository(),
    packages: repository([
      {
        id: PACKAGE_PUBLISHED,
        tenant_id: TENANT_ID,
        catalog_id: CATALOG_ACTIVE,
        status: 'published',
        manifest_hash: manifestHash,
      },
    ]),
  };
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
    repositories:
      overrides.repositories ?? catalogRepositories('sha256:matching-hash'),
    packageSigner: overrides.packageSigner ?? {
      sign: vi.fn(async (manifestHash: string) => ({
        signature: `sha256-of-${manifestHash}`,
        signer: 'detran-backend-local',
        kind: 'local-unsigned' as const,
      })),
    },
    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function queryContent(
  dependencies: Deps,
  id: string,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./package-content.query.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/normative/src/handwritten/package-content.query.ts ainda não existe (TASK-0007, CTG-0003 §11)',
      { cause },
    );
  }
  const exported =
    (loaded.PackageContentQuery as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'package-content.query.ts não exporta uma query construtível (CTG-0003 §11)',
    );
  }
  const Query = exported as new (
    dependencies: unknown,
  ) => Record<string, unknown>;
  const query = new Query(dependencies);
  const method = ['execute', 'handle', 'run']
    .map((name) => query[name])
    .find((value) => typeof value === 'function');
  if (typeof method !== 'function') {
    throw new Error(
      'package-content.query.ts não expõe execute|handle|run (CTG-0003 §6.5)',
    );
  }
  return (await (method as (value: unknown) => Promise<unknown>).call(
    query,
    id,
  )) as Record<string, unknown>;
}

describe('CTG-0003 §6.5 — mobile-packages/{id}/content: recomposição e assinatura local (C-0003-27…28)', () => {
  it('C-0003-27 — dado um pacote published cujo catálogo mudou desde a geração então 422 TEAT.PACKAGE_MANIFEST_MISMATCH', async () => {
    // manifest_hash gravado não bate com o manifesto recomposto a partir das
    // linhas active atuais do catálogo (framing acrescentado depois de gerar).
    const dependencies = deps({
      repositories: catalogRepositories('sha256:hash-gravado-antes-da-mudanca'),
    });
    await expect(
      queryContent(dependencies, PACKAGE_PUBLISHED),
    ).rejects.toMatchObject({
      code: 'TEAT.PACKAGE_MANIFEST_MISMATCH',
      status: 422,
      context: expect.objectContaining({ packageId: PACKAGE_PUBLISHED }),
    });
  });

  it('C-0003-28 — dado GET .../content íntegro então a resposta traz signature.kind=local-unsigned, signature.signer=detran-backend-local e ETag=manifest_hash', async () => {
    // Recompõe o mesmo repositório duas vezes para obter o manifest_hash real
    // e então gravar essa mesma linha como "íntegra" (hash gravado == recomposto).
    const probe = catalogRepositories('sha256:probe');
    const probeDeps = deps({ repositories: probe });
    let manifestHash: string | undefined;
    try {
      await queryContent(probeDeps, PACKAGE_PUBLISHED);
    } catch (error) {
      const context = (error as { context?: { expected?: string } }).context;
      manifestHash = context?.expected;
    }
    if (!manifestHash) {
      throw new Error(
        'não foi possível descobrir o manifest_hash recomposto a partir do 422 (o comando ainda não existe)',
      );
    }
    const dependencies = deps({
      repositories: catalogRepositories(manifestHash),
    });
    const response = await queryContent(dependencies, PACKAGE_PUBLISHED);
    expect(response.manifest_hash).toBe(manifestHash);
    const signature = response.signature as {
      kind?: string;
      signer?: string;
    };
    expect(signature.kind).toBe('local-unsigned');
    expect(signature.signer).toBe('detran-backend-local');
  });
});
