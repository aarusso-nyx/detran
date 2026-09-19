import { describe, expect, it, vi } from 'vitest';

/**
 * CTG-0003 §5.1/§5.2 e §10 (R-0008, TASK-0006) — C-0003-15…19: `POST/GET
 * /v1/ops/snapshots/external-queries` (M12). `handwritten/external-query.command.ts`
 * nasce em TASK-0007 (CTG-0003 §11). Nome esperado do export:
 * `ExternalQueryCommand`, construtor `(deps)`, métodos `execute` (create) e
 * `list` (leitura).
 *
 * Canônico (CTG-0003 §5.1, ADR-0003): as portas `WsdenatranReadPort`/`RenachPort`
 * chegam por `SNAPSHOT_QUERY_PORTS`; nenhum `fetch` sai daqui — o stub prova
 * (C-0003-35, em `tests/integration/`). Fixtures: `snapshots_vehicle`
 * `…ef600001` (plate `BRA2E19`, `make_model='Fixture Sedan 1.6'`).
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const VEHICLE_ID = '00000000-0000-7000-8000-0000ef600001';

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    list: vi.fn(async () => [...store]),
    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    findBy: vi.fn(
      async (predicate: (row: Record<string, unknown>) => boolean) =>
        store.find(predicate),
    ),
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

interface VehicleRecord {
  plate?: string;
  makeModelDescription?: string;
  [key: string]: unknown;
}

interface Ports {
  wsdenatranRead: { findVehicleByPlate: ReturnType<typeof vi.fn> };
  renach: {
    findDriverByCpf: ReturnType<typeof vi.fn>;
    findDriverByLicense: ReturnType<typeof vi.fn>;
  };
}

interface Deps {
  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
  requestContext: {
    hasActiveContext(): boolean;
    snapshot(): { tenantId: string; actorId: string };
  };
  repositories: Record<string, ReturnType<typeof repository>>;
  ports: Ports;
  clock: { now(): string };
}

/**
 * CTG-0003 §14.3: `agencyOfPrincipal` consulta
 * `select traffic_agency_id from ops.ops_agent_profile where user_ref = $1`
 * sob a transação. O stub por padrão devolve a agência da fixture
 * (`…e2000001`, perfil `…b0000001`) para não quebrar os casos que não
 * envolvem resolução de órgão; `agencyProfileRows` no override troca o
 * resultado (ex.: `[]` para o principal sem perfil, C-0003 §14.3 fail-closed).
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
      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
    },
    repositories: {
      vehicles: repository([
        {
          id: VEHICLE_ID,
          tenant_id: TENANT_ID,
          plate: 'BRA2E19',
          make_model: 'Fixture Sedan 1.6',
          source: 'wsdenatran',
        },
      ]),
      persons: repository(),
      personDocuments: repository(),
      vehicleSnapshots: repository(),
      externalQueries: repository(),
      ...(overrides.repositories ?? {}),
    },
    ports: overrides.ports ?? {
      wsdenatranRead: {
        findVehicleByPlate: vi.fn(
          async (): Promise<VehicleRecord | undefined> => undefined,
        ),
      },
      renach: {
        findDriverByCpf: vi.fn(async () => undefined),
        findDriverByLicense: vi.fn(async () => undefined),
      },
    },
    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
  };
}

function input(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    query_type: 'vehicle_by_plate',
    parameters: { plate: 'BRA2E19' },
    purpose: 'fiscalizacao-de-transito',
    agent_id: ACTOR_ID,
    ...overrides,
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function loadCommand(
  dependencies: Deps,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./external-query.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'ops/snapshots/src/handwritten/external-query.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
      { cause },
    );
  }
  const exported =
    (loaded.ExternalQueryCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'external-query.command.ts não exporta um comando construtível (CTG-0003 §11)',
    );
  }
  const Command = exported as new (
    dependencies: unknown,
  ) => Record<string, unknown>;
  return new Command(dependencies);
}

async function createQuery(
  dependencies: Deps,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const command = await loadCommand(dependencies);
  const method = ['execute', 'create', 'handle']
    .map((name) => command[name])
    .find((value) => typeof value === 'function');
  if (typeof method !== 'function') {
    throw new Error(
      'external-query.command.ts não expõe execute|create|handle (CTG-0003 §5.1)',
    );
  }
  return (await (method as (value: unknown) => Promise<unknown>).call(
    command,
    body,
  )) as Record<string, unknown>;
}

async function listQueries(
  dependencies: Deps,
): Promise<Record<string, unknown>[]> {
  const command = await loadCommand(dependencies);
  const method = ['list', 'read']
    .map((name) => command[name])
    .find((value) => typeof value === 'function');
  if (typeof method !== 'function') {
    throw new Error(
      'external-query.command.ts não expõe list|read (CTG-0003 §5.2)',
    );
  }
  const result = (await (method as () => Promise<unknown>).call(command)) as {
    items?: Record<string, unknown>[];
  };
  return Array.isArray(result) ? result : (result.items ?? []);
}

describe('CTG-0003 §5.1 — external-queries: forma, portas e efeito (C-0003-15…18)', () => {
  it('C-0003-15 — dado external-queries sem purpose então 400 TEAT.QUERY_PURPOSE_REQUIRED', async () => {
    const dependencies = deps();
    const body = input();
    delete body.purpose;
    await expect(createQuery(dependencies, body)).rejects.toMatchObject({
      code: 'TEAT.QUERY_PURPOSE_REQUIRED',
      status: 400,
    });
  });

  it('dado query_type inválido então 400 TEAT.ENUM_INVALID', async () => {
    const dependencies = deps();
    await expect(
      createQuery(dependencies, input({ query_type: 'foo' })),
    ).rejects.toMatchObject({
      code: 'TEAT.ENUM_INVALID',
      status: 400,
    });
  });

  it('C-0003-16 — dado o stub de WsdenatranReadPort.findVehicleByPlate devolvendo undefined então 404 TEAT.QUERY_NOT_FOUND e uma snapshots_external_query status=not_found', async () => {
    const dependencies = deps();
    await expect(createQuery(dependencies, input())).rejects.toMatchObject({
      code: 'TEAT.QUERY_NOT_FOUND',
      status: 404,
      context: expect.objectContaining({ queryType: 'vehicle_by_plate' }),
    });
    expect(dependencies.repositories.externalQueries.rows).toContainEqual(
      expect.objectContaining({ status: 'not_found' }),
    );
  });

  it('C-0003-17 — dado o stub lançando então 503 TEAT.QUERY_UPSTREAM_UNAVAILABLE e uma snapshots_external_query status=failed', async () => {
    const dependencies = deps({
      ports: {
        wsdenatranRead: {
          findVehicleByPlate: vi.fn(async () => {
            throw new Error('upstream unavailable');
          }),
        },
        renach: {
          findDriverByCpf: vi.fn(async () => undefined),
          findDriverByLicense: vi.fn(async () => undefined),
        },
      },
    });
    await expect(createQuery(dependencies, input())).rejects.toMatchObject({
      code: 'TEAT.QUERY_UPSTREAM_UNAVAILABLE',
      status: 503,
      context: expect.objectContaining({ queryType: 'vehicle_by_plate' }),
    });
    expect(dependencies.repositories.externalQueries.rows).toContainEqual(
      expect.objectContaining({ status: 'failed' }),
    );
  });

  it('C-0003-18a — dado um VehicleRecord com make_model diferente do já congelado então divergence_recorded=true', async () => {
    const dependencies = deps({
      ports: {
        wsdenatranRead: {
          findVehicleByPlate: vi.fn(async () => ({
            plate: 'BRA2E19',
            makeModelDescription: 'Outro Modelo 2.0',
          })),
        },
        renach: {
          findDriverByCpf: vi.fn(async () => undefined),
          findDriverByLicense: vi.fn(async () => undefined),
        },
      },
    });
    const response = await createQuery(dependencies, input());
    expect(response.divergence_recorded).toBe(true);
  });

  it('C-0003-18b — dado um VehicleRecord idêntico ao já congelado então divergence_recorded=false', async () => {
    const dependencies = deps({
      ports: {
        wsdenatranRead: {
          findVehicleByPlate: vi.fn(async () => ({
            plate: 'BRA2E19',
            makeModelDescription: 'Fixture Sedan 1.6',
          })),
        },
        renach: {
          findDriverByCpf: vi.fn(async () => undefined),
          findDriverByLicense: vi.fn(async () => undefined),
        },
      },
    });
    const response = await createQuery(dependencies, input());
    expect(response.divergence_recorded).toBe(false);
  });
});

describe('CTG-0003 §5.2 — GET external-queries: sem dado pessoal exposto (C-0003-19)', () => {
  it('C-0003-19 — dado GET external-queries então nenhum item traz parameters, só parameters_hash', async () => {
    const dependencies = deps({
      repositories: {
        vehicles: repository(),
        persons: repository(),
        personDocuments: repository(),
        vehicleSnapshots: repository(),
        externalQueries: repository([
          {
            id: 'query-1',
            tenant_id: TENANT_ID,
            traffic_agency_id: AGENCY_ID,
            query_type: 'vehicle_by_plate',
            parameters_hash: 'sha256:abc',
            purpose: 'fiscalizacao-de-transito',
            queried_at: '2026-09-14T10:00:00-04:00',
            status: 'ok',
            user_ref: ACTOR_ID,
          },
        ]),
      },
    });
    const items = await listQueries(dependencies);
    expect(items).toHaveLength(1);
    for (const item of items) {
      expect(item.parameters).toBeUndefined();
      expect(item.parameters_hash).toBe('sha256:abc');
    }
  });
});

/**
 * CTG-0003 §14 item 3 (adenda do maestro, 2026-09-16, delivery-review ciclo 1
 * achado §14.3, substitui OD-T57) — TASK-0006 iteração 3: `external-queries`
 * sem `traffic_agency_id` no corpo resolve pelo `ops_agent_profile` do
 * principal; sem nenhuma fonte, 422 fail-closed; nunca o id do tenant.
 *
 * Escrito em paralelo à iteração 3 do Engineer: `external-query.command.ts`
 * já traz `resolveAgency()` (corpo → `agencyOfPrincipal` → 422) lida antes de
 * fechar os casos abaixo.
 */
describe('CTG-0003 §14.3 — external-queries: resolução de traffic_agency_id', () => {
  function depsWithResolvedVehicle(overrides: Partial<Deps> = {}): Deps {
    return deps({
      ports: {
        wsdenatranRead: {
          findVehicleByPlate: vi.fn(async () => ({
            plate: 'BRA2E19',
            makeModelDescription: 'Fixture Sedan 1.6',
          })),
        },
        renach: {
          findDriverByCpf: vi.fn(async () => undefined),
          findDriverByLicense: vi.fn(async () => undefined),
        },
      },
      ...overrides,
    });
  }

  it('dado o corpo sem traffic_agency_id e o principal com perfil então a linha gravada usa o órgão do perfil (…e2000001), nunca o tenant_id', async () => {
    const dependencies = depsWithResolvedVehicle();
    const body = input();
    expect(body.traffic_agency_id).toBeUndefined();
    await createQuery(dependencies, body);
    const saved = dependencies.repositories.externalQueries.rows[0];
    expect(saved?.traffic_agency_id).toBe(AGENCY_ID);
    expect(saved?.traffic_agency_id).not.toBe(TENANT_ID);
  });

  it('dado traffic_agency_id explícito no corpo então prevalece sobre o perfil do principal', async () => {
    const EXPLICIT_AGENCY = '00000000-0000-7000-8000-0000e2000099';
    const dependencies = depsWithResolvedVehicle();
    await createQuery(
      dependencies,
      input({ traffic_agency_id: EXPLICIT_AGENCY }),
    );
    const saved = dependencies.repositories.externalQueries.rows[0];
    expect(saved?.traffic_agency_id).toBe(EXPLICIT_AGENCY);
  });

  it('dado o corpo sem traffic_agency_id e o principal sem ops_agent_profile (tenant isolado) então 422 TEAT.VALIDATION_FAILED com fields=[{ path: "traffic_agency_id", rule: "required" }], e nada persistido', async () => {
    const dependencies = deps({ database: defaultTx([]) });
    await expect(createQuery(dependencies, input())).rejects.toMatchObject({
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
    expect(dependencies.repositories.externalQueries.rows).toEqual([]);
  });
});
