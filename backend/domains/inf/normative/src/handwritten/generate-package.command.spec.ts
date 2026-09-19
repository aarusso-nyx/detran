import { describe, expect, it, vi } from 'vitest';

/**
 * CTG-0003 §3/§6.2 e §10 (R-0008, TASK-0006) — C-0003-20…22: `POST
 * /v1/inf/normative/mobile-packages/generate` (M13).
 * `handwritten/generate-package.command.ts` nasce em TASK-0007 (CTG-0003
 * §11). Nome esperado do export: `GeneratePackageCommand`, construtor
 * `(deps)`, método `execute`.
 *
 * Fixtures: `normative_catalog` `…e0000001` (`active`, corrigido por
 * `27-fixtures-teat-evidence.sql` — OD-T35) e `…e0000002` (`draft`);
 * `normative_framing`/`normative_metrological_table`/`normative_validation_rule`/
 * `normative_document_template`/`normative_agency_parameter` `active` do
 * catálogo `…e0000001`.
 *
 * Canônico (CTG-0003 §3): manifesto = JSON canônico (chaves ordenadas) das
 * seis coleções, só linhas `status='active'`; `manifest_hash='sha256:'+sha256hex`.
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';
const CATALOG_DRAFT = '00000000-0000-7000-8000-0000e0000002';

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    list: vi.fn(async () => [...store]),
    listWhere: vi.fn(
      async (predicate: (row: Record<string, unknown>) => boolean) =>
        store.filter(predicate),
    ),
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
  clock: { now(): string };
}

function activeCatalogRows() {
  return {
    catalogs: repository([
      {
        id: CATALOG_ACTIVE,
        tenant_id: TENANT_ID,
        status: 'active',
        name: 'Catálogo CONTRAN',
        version: '2026.1',
      },
      {
        id: CATALOG_DRAFT,
        tenant_id: TENANT_ID,
        status: 'draft',
        name: 'Catálogo CONTRAN — revisão 2026.2',
        version: '2026.2',
      },
    ]),
    framings: repository([
      {
        id: '00000000-0000-7000-8000-0000e1000001',
        catalog_id: CATALOG_ACTIVE,
        status: 'active',
        framing_code: '7455-0',
      },
      {
        id: '00000000-0000-7000-8000-0000e1000002',
        catalog_id: CATALOG_ACTIVE,
        status: 'active',
        framing_code: '5541-0',
      },
    ]),
    metrologicalTables: repository([
      {
        id: '00000000-0000-7000-8000-0000eb000001',
        catalog_id: CATALOG_ACTIVE,
        status: 'active',
      },
    ]),
    validationRules: repository([
      {
        id: '00000000-0000-7000-8000-0000e1100001',
        catalog_id: CATALOG_ACTIVE,
        status: 'active',
      },
    ]),
    documentTemplates: repository([
      {
        id: '00000000-0000-7000-8000-0000e1200001',
        traffic_agency_id: AGENCY_ID,
        status: 'active',
      },
    ]),
    agencyParameters: repository([
      {
        id: '00000000-0000-7000-8000-0000e1300001',
        traffic_agency_id: AGENCY_ID,
        status: 'active',
      },
    ]),
    packages: repository(),
  };
}

/**
 * CTG-0003 §14.3: `agencyOfPrincipal` consulta `ops.ops_agent_profile` sob a
 * transação. Por padrão o stub devolve a agência da fixture (`…e2000001`,
 * perfil `…b0000001`) para não quebrar os casos que não envolvem resolução
 * de órgão; `agencyProfileRows` no override troca o resultado.
 */
function defaultTx(agencyProfileRows: Record<string, unknown>[]) {
  return {
    async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
      return work({
        query: vi.fn(async (sql: string) =>
          typeof sql === 'string' && sql.includes('ops_agent_profile')
            ? { rows: agencyProfileRows }
            : { rows: [] },
        ),
      });
    },
  };
}

function deps(overrides: Partial<Deps> = {}): Deps {
  return {
    database:
      overrides.database ?? defaultTx([{ traffic_agency_id: AGENCY_ID }]),
    requestContext: overrides.requestContext ?? {
      hasActiveContext: () => true,
      snapshot: () => ({
        tenantId: TENANT_ID,
        actorId: '00000000-0000-4000-8000-0000b0000001',
      }),
    },
    repositories: overrides.repositories ?? activeCatalogRows(),
    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
  };
}

function input(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    catalog_id: CATALOG_ACTIVE,
    package_version: `2026.1-${Math.random().toString(36).slice(2, 8)}`,
    ...overrides,
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function generatePackage(
  dependencies: Deps,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./generate-package.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'inf/normative/src/handwritten/generate-package.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
      { cause },
    );
  }
  const exported =
    (loaded.GeneratePackageCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'generate-package.command.ts não exporta um comando construtível (CTG-0003 §11)',
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
      'generate-package.command.ts não expõe execute|handle|run (CTG-0003 §6.2)',
    );
  }
  return (await (method as (value: unknown) => Promise<unknown>).call(
    command,
    body,
  )) as Record<string, unknown>;
}

describe('CTG-0003 §6.2 — mobile-packages/generate: catálogo ativo e manifesto (C-0003-20…22)', () => {
  it('C-0003-20 — dado o catálogo …e0000002 (draft) quando generate então 422 TEAT.PACKAGE_CATALOG_NOT_ACTIVE com { catalogId, currentState }', async () => {
    const dependencies = deps();
    await expect(
      generatePackage(dependencies, input({ catalog_id: CATALOG_DRAFT })),
    ).rejects.toMatchObject({
      code: 'TEAT.PACKAGE_CATALOG_NOT_ACTIVE',
      status: 422,
      context: expect.objectContaining({
        catalogId: CATALOG_DRAFT,
        currentState: 'draft',
      }),
    });
  });

  it('C-0003-21 — dado o catálogo ativo quando generate (duas vezes) então o manifest_hash é determinístico', async () => {
    const dependencies = deps();
    const first = await generatePackage(
      dependencies,
      input({ package_version: '2026.1-a' }),
    );
    const second = await generatePackage(
      dependencies,
      input({ package_version: '2026.1-b' }),
    );
    expect(first.manifest_hash).toEqual(expect.stringMatching(/^sha256:/));
    expect(second.manifest_hash).toBe(first.manifest_hash);
  });

  it('C-0003-22 — dado generate então o manifesto contém apenas linhas status=active das seis coleções: uma linha retired a mais não muda o manifest_hash', async () => {
    const baseline = deps();
    const baselineResponse = await generatePackage(
      baseline,
      input({ package_version: '2026.1-baseline' }),
    );

    const repositoriesWithRetired = activeCatalogRows();
    repositoriesWithRetired.framings.rows.push({
      id: 'framing-inactive',
      catalog_id: CATALOG_ACTIVE,
      status: 'retired',
      framing_code: '0000-0',
    });
    const withRetired = deps({ repositories: repositoriesWithRetired });
    const withRetiredResponse = await generatePackage(
      withRetired,
      input({ package_version: '2026.1-with-retired' }),
    );

    expect(withRetiredResponse.manifest_hash).toBe(
      baselineResponse.manifest_hash,
    );
    expect(baselineResponse.status).toBe('draft');
  });
});

/**
 * CTG-0003 §14 item 3 (adenda do maestro, 2026-09-16, delivery-review ciclo 1
 * achado §14.3, substitui OD-T57) — TASK-0006 iteração 3: `mobile-packages/generate`
 * sem `traffic_agency_id` no corpo resolve por `ops_agent_profile` do
 * principal e, na ausência dele, por `catalog.traffic_agency_id`; sem
 * nenhuma fonte, 422 fail-closed; nunca o id do tenant.
 *
 * Escrito em paralelo à iteração 3 do Engineer: `generate-package.command.ts`
 * já traz `resolveAgency()` (corpo → perfil → catálogo → 422) lida antes de
 * fechar os casos abaixo.
 */
describe('CTG-0003 §14.3 — mobile-packages/generate: resolução de traffic_agency_id', () => {
  it('dado o corpo sem traffic_agency_id e o principal com perfil então o pacote gravado usa o órgão do perfil (…e2000001), nunca o tenant_id', async () => {
    const dependencies = deps();
    const body = input();
    expect(body.traffic_agency_id).toBeUndefined();
    const response = await generatePackage(dependencies, body);
    const saved = dependencies.repositories.packages.rows.find(
      (row) => row.id === response.id,
    );
    expect(saved?.traffic_agency_id).toBe(AGENCY_ID);
    expect(saved?.traffic_agency_id).not.toBe(TENANT_ID);
  });

  it('dado traffic_agency_id explícito no corpo então prevalece sobre o perfil do principal', async () => {
    const EXPLICIT_AGENCY = '00000000-0000-7000-8000-0000e2000099';
    const dependencies = deps();
    const response = await generatePackage(
      dependencies,
      input({ traffic_agency_id: EXPLICIT_AGENCY }),
    );
    const saved = dependencies.repositories.packages.rows.find(
      (row) => row.id === response.id,
    );
    expect(saved?.traffic_agency_id).toBe(EXPLICIT_AGENCY);
  });

  it('dado sem corpo e sem perfil, mas o catálogo tem traffic_agency_id então o pacote usa o órgão do catálogo', async () => {
    const CATALOG_AGENCY = '00000000-0000-7000-8000-0000e2000088';
    const repositories = activeCatalogRows();
    const catalog = repositories.catalogs.rows.find(
      (row) => row.id === CATALOG_ACTIVE,
    );
    if (catalog) catalog.traffic_agency_id = CATALOG_AGENCY;
    const dependencies = deps({
      database: defaultTx([]),
      repositories,
    });
    const response = await generatePackage(dependencies, input());
    const saved = dependencies.repositories.packages.rows.find(
      (row) => row.id === response.id,
    );
    expect(saved?.traffic_agency_id).toBe(CATALOG_AGENCY);
  });

  it('dado sem corpo, sem perfil do principal e sem traffic_agency_id no catálogo então 422 TEAT.VALIDATION_FAILED com fields=[{ path: "traffic_agency_id", rule: "required" }], e nenhum pacote persistido', async () => {
    const dependencies = deps({ database: defaultTx([]) });
    await expect(generatePackage(dependencies, input())).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 422,
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({
            path: 'traffic_agency_id',
            rule: 'required',
          }),
        ]),
      }),
    });
    expect(dependencies.repositories.packages.rows).toEqual([]);
  });
});
