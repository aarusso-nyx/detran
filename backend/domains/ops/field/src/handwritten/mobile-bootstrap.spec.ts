import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * CTG-0002 §5.1…§5.3, §5.6 e §6 (R-0008, TASK-0004) — C-0002-19…26: bootstrap
 * móvel (M9), ordem fixa de bloqueadores e avisos, `capabilities`, e o handoff
 * de sessão (M10, D-01/AC-TEAT-012-4).
 *
 * `handwritten/mobile-bootstrap.service.ts` e `handwritten/handoff-session.command.ts`
 * nascem em TASK-0005 (CTG-0002 §11). Como em `ops/offline-sync`, o módulo é
 * carregado por `import()` dinâmico dentro de cada teste para que o arquivo
 * colete e cada caso falhe isolado pelo comportamento ausente.
 *
 * Canônico aqui: `MOBILE_BOOTSTRAP_PROTOCOL_VERSION`, os códigos do
 * `teat-error-catalog.md` §2, os dez tokens de `readiness.blockers[]` **na
 * ordem** da §5.3, os avisos, as três `capabilities` e os campos nulos de
 * `snapshot` (OD-T14). Proposta do Inspector, não valor canônico: o nome do
 * símbolo exportado, o nome do método e a forma do objeto de dependências —
 * o carregador tolera qualquer nome plausível (OD no relatório da tarefa).
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const OTHER_TENANT_ID = '00000000-0000-7000-8000-00000000a002';
const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
const UNIT_ID = '00000000-0000-7000-8000-0000e2100001';
const DEVICE_AUTHORIZED = '00000000-0000-7000-8000-0000e4000002';
const DEVICE_BLOCKED = '00000000-0000-7000-8000-0000e4000003';
const DEVICE_TAMPERED = '00000000-0000-7000-8000-0000e4000004';
const HOMOLOGATION_ACTIVE = '00000000-0000-7000-8000-0000e2200001';
const HOMOLOGATION_EXPIRED_REPORT = '00000000-0000-7000-8000-0000e2200002';
const APP_VERSION_ID = '00000000-0000-7000-8000-0000e2300001';
const SHIFT_OPEN = '00000000-0000-7000-8000-0000e3000001';
const RESERVATION_RESERVED = '00000000-0000-7000-8000-0000e6000001';
const RANGE_ID = '00000000-0000-7000-8000-0000e5000001';
const PACKAGE_ID = '00000000-0000-7000-8000-0000e7000001';
const CATALOG_ID = '00000000-0000-7000-8000-0000e0000001';

/** Constante da origem, preservada em CTG-0002 §5.2. */
const PROTOCOL_VERSION = 'teat-mobile-bootstrap.v1';
const APP_VERSION = '1.0.0';

/** Relógio fixo: "hoje" das fixtures é 2026-09-14 (America/Manaus). */
const NOW = '2026-09-14T14:00:00.000Z';

/** CTG-0002 §5.3 — `readiness.blockers[]` sai exatamente nesta ordem. */
const BLOCKER_ORDER = [
  'SESSION_NOT_EXCLUSIVE',
  'DEVICE_NOT_AUTHORIZED',
  'DEVICE_TAMPER_DETECTED',
  'DEVICE_NOT_HOMOLOGATED',
  'APP_VERSION_NOT_ALLOWED',
  'NORMATIVE_PACKAGE_MISSING',
  'NUMBERING_RESERVATION_REQUIRED',
  'AGENT_NOT_ACTIVE',
  'AGENT_NOT_IN_UNIT',
  'SHIFT_ALREADY_OPEN_ELSEWHERE',
] as const;

function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    list: vi.fn(async () => [...store]),
    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
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

function device(
  id: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id,
    tenant_id: TENANT_ID,
    traffic_agency_id: AGENCY_ID,
    hardware_identifier_hash: `sha256:teat-device-${id.slice(-6)}`,
    os_name: 'android',
    status: 'authorized',
    app_version: APP_VERSION,
    tamper_flag: false,
    ...overrides,
  };
}

function agent(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: AGENT_ID,
    tenant_id: TENANT_ID,
    traffic_agency_id: AGENCY_ID,
    user_ref: AGENT_ID,
    operational_unit_id: UNIT_ID,
    registration_number: 'MAT-000001',
    functional_status: 'active',
    credential_valid_until: '2027-12-31',
    ...overrides,
  };
}

function homologation(
  id: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id,
    tenant_id: TENANT_ID,
    traffic_agency_id: AGENCY_ID,
    homologation_number: `HOM-${id.slice(-6)}`,
    scope: 'Talão eletrônico',
    issued_at: '2025-12-01',
    valid_until: '2029-12-31',
    laudo_valido_ate: '2029-12-31',
    status: 'active',
    ...overrides,
  };
}

function reservation(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: RESERVATION_RESERVED,
    tenant_id: TENANT_ID,
    range_id: RANGE_ID,
    traffic_agency_id: AGENCY_ID,
    agent_id: AGENT_ID,
    device_id: DEVICE_AUTHORIZED,
    shift_id: SHIFT_OPEN,
    start_number: 2026000001,
    end_number: 2026000001,
    valid_until: '2026-12-31T23:59:59.000Z',
    status: 'reserved',
    ...overrides,
  };
}

interface World {
  devices: Record<string, unknown>[];
  agents: Record<string, unknown>[];
  homologations: Record<string, unknown>[];
  appVersions: Record<string, unknown>[];
  shifts: Record<string, unknown>[];
  handoffs: Record<string, unknown>[];
  reservations: Record<string, unknown>[];
  packages: Record<string, unknown>[];
}

function world(overrides: Partial<World> = {}): World {
  return {
    devices: [
      device(DEVICE_AUTHORIZED),
      device(DEVICE_BLOCKED, { status: 'blocked' }),
      device(DEVICE_TAMPERED, { tamper_flag: true }),
    ],
    agents: [agent()],
    homologations: [homologation(HOMOLOGATION_ACTIVE)],
    appVersions: [
      {
        id: APP_VERSION_ID,
        tenant_id: TENANT_ID,
        app_type: 'mobile',
        version: APP_VERSION,
        status: 'active',
        valid_from: '2026-01-01',
        valid_to: null,
      },
    ],
    shifts: [],
    handoffs: [],
    reservations: [reservation()],
    packages: [
      {
        id: PACKAGE_ID,
        tenant_id: TENANT_ID,
        traffic_agency_id: AGENCY_ID,
        catalog_id: CATALOG_ID,
        package_version: '2026.1',
        manifest_hash: 'sha256:teat-normative-2026-1',
        published_at: '2026-09-14T14:00:00.000Z',
        valid_until: '2026-12-31',
        status: 'published',
      },
    ],
    ...overrides,
  };
}

function deps(state: World = world()) {
  const repositories = {
    devices: repository(state.devices),
    agents: repository(state.agents),
    homologations: repository(state.homologations),
    appVersions: repository(state.appVersions),
    shifts: repository(state.shifts),
    handoffs: repository(state.handoffs),
    reservations: repository(state.reservations),
    packages: repository(state.packages),
    units: repository([
      {
        id: UNIT_ID,
        tenant_id: TENANT_ID,
        traffic_agency_id: AGENCY_ID,
        name: 'Unidade Operacional Centro',
      },
    ]),
    teams: repository(),
    patrolVehicles: repository(),
    operations: repository(),
    measurementInstruments: repository(),
    deviceEvents: repository(),
  };
  return {
    repositories,
    database: {
      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
        return work({ query: vi.fn(async () => ({ rows: [] })) });
      },
    },
    requestContext: {
      hasActiveContext: () => true,
      snapshot: () => ({ tenantId: TENANT_ID, actorId: AGENT_ID }),
    },
    parameters: {
      get: vi.fn(async (key: string) => ({
        key,
        value_json: 'warn (lavra com flag de risco; autoridade decide)',
        source_pending: false,
      })),
    },
    outbox: { append: vi.fn(async () => ({ id: 'outbox-row-1' })) },
    clock: { now: () => NOW, today: () => NOW.slice(0, 10) },
  };
}

type Deps = ReturnType<typeof deps>;

/**
 * `import()` com especificador **variável** de propósito: o módulo só nasce em
 * TASK-0005 e um literal faria `tsc --noEmit` (e portanto `pnpm check`) quebrar
 * com TS2307 antes de o Engineer criar o arquivo. Com a variável, a resolução
 * acontece em tempo de execução, relativa a este arquivo, e a ausência aparece
 * como falha do teste — que é o que o tier pede.
 */
const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function loadCommand(
  specifier: string,
  exportNames: readonly string[],
  methodNames: readonly string[],
  dependencies: Deps,
  input: unknown,
  ...rest: unknown[]
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule(specifier)) as Record<string, unknown>;
  } catch (cause) {
    throw new Error(
      `ops/field/src/handwritten/${specifier.replace('./', '').replace('.js', '.ts')} ainda não existe (TASK-0005, CTG-0002 §11)`,
      { cause },
    );
  }
  const exported =
    exportNames
      .map((name) => loaded[name])
      .find((value) => typeof value === 'function') ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      `${specifier} não exporta nada construtível (esperado um de ${exportNames.join('|')})`,
    );
  }
  const Command = exported as new (
    dependencies: unknown,
  ) => Record<string, unknown>;
  const instance = new Command(dependencies);
  const method = methodNames
    .map((name) => instance[name])
    .find((value) => typeof value === 'function');
  if (typeof method !== 'function') {
    throw new Error(
      `${specifier} não expõe nenhum de ${methodNames.join('|')} (CTG-0002 §5)`,
    );
  }
  return (await (method as (...args: unknown[]) => Promise<unknown>).call(
    instance,
    input,
    ...rest,
  )) as Record<string, unknown>;
}

function bootstrap(
  dependencies: Deps,
  query: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  return loadCommand(
    './mobile-bootstrap.service.js',
    ['MobileBootstrapService', 'MobileBootstrap', 'MobileBootstrapCommand'],
    ['read', 'bootstrap', 'execute', 'handle'],
    dependencies,
    { device_id: DEVICE_AUTHORIZED, app_version: APP_VERSION, ...query },
  );
}

function handoff(
  dependencies: Deps,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return loadCommand(
    './handoff-session.command.js',
    ['HandoffSessionCommand', 'HandoffSession', 'HandoffSessionService'],
    ['execute', 'handoff', 'handle', 'run'],
    dependencies,
    body,
  );
}

function readiness(response: Record<string, unknown>): {
  blockers: string[];
  warnings: string[];
  preShiftReady?: boolean;
  offlineReady?: boolean;
} {
  const value = (response.readiness ?? {}) as Record<string, unknown>;
  return {
    blockers: (value.blockers ?? []) as string[],
    warnings: (value.warnings ?? []) as string[],
    preShiftReady: value.preShiftReady as boolean | undefined,
    offlineReady: value.offlineReady as boolean | undefined,
  };
}

function capabilities(
  response: Record<string, unknown>,
): Record<string, unknown> {
  return (response.capabilities ?? {}) as Record<string, unknown>;
}

/** A ordem observada precisa ser subsequência da ordem canônica da §5.3. */
function expectBlockerOrder(blockers: readonly string[]): void {
  const positions = blockers.map((token) =>
    BLOCKER_ORDER.indexOf(token as never),
  );
  expect(
    positions.every((position) => position >= 0),
    `bloqueador fora do vocabulário da §5.3: ${blockers.join(', ')}`,
  ).toBe(true);
  expect(
    positions,
    `readiness.blockers[] precisa sair na ordem fixa da §5.3: ${blockers.join(', ')}`,
  ).toEqual([...positions].sort((left, right) => left - right));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CTG-0002 §5.1/§5.2 — escopo e protocolo do bootstrap (C-0002-19/20)', () => {
  it('C-0002-19 — dado protocol_version teat-mobile-bootstrap.v0 quando GET mobile-bootstrap então 426 TEAT.PROTOCOL_VERSION_UNSUPPORTED com context.supported = [teat-mobile-bootstrap.v1]', async () => {
    await expect(
      bootstrap(deps(), { protocol_version: 'teat-mobile-bootstrap.v0' }),
    ).rejects.toMatchObject({
      code: 'TEAT.PROTOCOL_VERSION_UNSUPPORTED',
      status: 426,
      context: expect.objectContaining({ supported: [PROTOCOL_VERSION] }),
    });
  });

  it('C-0002-20 — dado um device_id de outro tenant então 403 TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH, e não 404 (não revela existência)', async () => {
    const dependencies = deps(
      world({
        devices: [device(DEVICE_AUTHORIZED, { tenant_id: OTHER_TENANT_ID })],
      }),
    );
    await expect(bootstrap(dependencies)).rejects.toMatchObject({
      code: 'TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH',
      status: 403,
    });
  });

  it('§5.2 — dado o dispositivo …e4000001 (sem linha em ops_operational_device) então 403 TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH, o caso negativo canônico da §9', async () => {
    await expect(
      bootstrap(deps(), {
        device_id: '00000000-0000-7000-8000-0000e4000001',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH',
      status: 403,
    });
  });

  it('§5.2 — dado installation_id cujo sha256 não bate com hardware_identifier_hash então 403 TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH e o valor cru nunca aparece na resposta', async () => {
    await expect(
      bootstrap(deps(), {
        installation_id: '00000000-0000-7000-8000-0000ee000001',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH',
      status: 403,
    });
  });
});

describe('CTG-0002 §5.3/§6 — bloqueadores, avisos e capabilities (C-0002-21…25)', () => {
  it('C-0002-21 — dado o device …e4000004 (tamper) então blockers traz DEVICE_TAMPER_DETECTED na ordem fixa da §5.3 e canOperateOffline = false', async () => {
    const response = await bootstrap(deps(), { device_id: DEVICE_TAMPERED });
    const { blockers } = readiness(response);
    expect(blockers).toContain('DEVICE_TAMPER_DETECTED');
    expectBlockerOrder(blockers);
    expect(capabilities(response).canOperateOffline).toBe(false);
  });

  it('§5.3 — dado o device …e4000003 (blocked) com laudo, versão e pacote ausentes então blockers sai na ordem DEVICE_NOT_AUTHORIZED, DEVICE_NOT_HOMOLOGATED, APP_VERSION_NOT_ALLOWED, NORMATIVE_PACKAGE_MISSING', async () => {
    const response = await bootstrap(
      deps(
        world({
          homologations: [],
          appVersions: [],
          packages: [],
        }),
      ),
      { device_id: DEVICE_BLOCKED },
    );
    const { blockers } = readiness(response);
    expectBlockerOrder(blockers);
    expect(blockers.slice(0, 4)).toEqual([
      'DEVICE_NOT_AUTHORIZED',
      'DEVICE_NOT_HOMOLOGATED',
      'APP_VERSION_NOT_ALLOWED',
      'NORMATIVE_PACKAGE_MISSING',
    ]);
  });

  it('C-0002-22 — dado o agente …b0000001 com reserva vigente então NUMBERING_RESERVATION_REQUIRED não aparece e canOpenShift = true', async () => {
    const response = await bootstrap(deps());
    const { blockers } = readiness(response);
    expect(blockers).not.toContain('NUMBERING_RESERVATION_REQUIRED');
    expect(capabilities(response).canOpenShift).toBe(true);
  });

  it('C-0002-22 — dado o mesmo agente sem reserva vigente então NUMBERING_RESERVATION_REQUIRED aparece e canOpenShift continua true (é o único bloqueador que não barra a abertura do turno)', async () => {
    const response = await bootstrap(deps(world({ reservations: [] })));
    const { blockers, preShiftReady, offlineReady } = readiness(response);
    expect(blockers).toContain('NUMBERING_RESERVATION_REQUIRED');
    expect(capabilities(response).canOpenShift).toBe(true);
    expect(capabilities(response).canOperateOffline).toBe(false);
    expect(preShiftReady).toBe(true);
    expect(offlineReady).toBe(false);
  });

  it('C-0002-23 — dada a homologação …e2200002 (laudo vencido) como única do órgão então warnings traz HOMOLOGATION_RENEWAL_DUE e blockers não traz DEVICE_NOT_HOMOLOGATED (H.55 avisa, não bloqueia)', async () => {
    const response = await bootstrap(
      deps(
        world({
          homologations: [
            homologation(HOMOLOGATION_EXPIRED_REPORT, {
              laudo_valido_ate: '2025-12-31',
            }),
          ],
        }),
      ),
    );
    const { blockers, warnings } = readiness(response);
    expect(warnings).toContain('HOMOLOGATION_RENEWAL_DUE');
    expect(blockers).not.toContain('DEVICE_NOT_HOMOLOGATED');
  });

  it('C-0002-24 — dado o pacote …e7000001 com valid_until no passado então warnings traz NORMATIVE_PACKAGE_EXPIRED e nunca um erro (E.29)', async () => {
    const state = world();
    state.packages[0]!.valid_until = '2026-08-31';
    const response = await bootstrap(deps(state));
    const { blockers, warnings } = readiness(response);
    expect(warnings).toContain('NORMATIVE_PACKAGE_EXPIRED');
    expect(blockers).not.toContain('NORMATIVE_PACKAGE_MISSING');
  });

  it('C-0002-25 — dado o bootstrap completo então snapshot.maxAgeSeconds e snapshot.validUntil são null (OD-T14) e protocolVersion ecoa a constante', async () => {
    const response = await bootstrap(deps());
    const snapshot = (response.snapshot ?? {}) as Record<string, unknown>;
    expect(snapshot.maxAgeSeconds).toBeNull();
    expect(snapshot.validUntil).toBeNull();
    expect(snapshot.authority).toBe('server-snapshot');
    expect(response.protocolVersion).toBe(PROTOCOL_VERSION);
    expect(response.requestedProtocolVersion).toBe(PROTOCOL_VERSION);
  });

  it('C-0002-25 — dado mobile-bootstrap.service.ts então a constante 300 de maxAgeSeconds da origem não aparece no código (OD-T14: o valor é source_pending)', async () => {
    const path = fileURLToPath(
      new URL('./mobile-bootstrap.service.ts', import.meta.url),
    );
    let source: string;
    try {
      source = await readFile(path, 'utf8');
    } catch (cause) {
      throw new Error(
        'ops/field/src/handwritten/mobile-bootstrap.service.ts ainda não existe (TASK-0005, CTG-0002 §11)',
        { cause },
      );
    }
    expect(
      /\bmaxAgeSeconds\b[^\n]*\b300\b/.test(source),
      'maxAgeSeconds não pode voltar a 300: sem linha no parameter-catalogue o campo é null (OD-T14)',
    ).toBe(false);
  });

  it('§5.3 — dado um turno open do agente em outro device sem handoff então blockers começa por SESSION_NOT_EXCLUSIVE e canOpenShift = false', async () => {
    const response = await bootstrap(
      deps(
        world({
          shifts: [
            {
              id: SHIFT_OPEN,
              tenant_id: TENANT_ID,
              traffic_agency_id: AGENCY_ID,
              agent_id: AGENT_ID,
              device_id: DEVICE_BLOCKED,
              operational_unit_id: UNIT_ID,
              started_at: '2026-09-14T12:00:00.000Z',
              status: 'open',
            },
          ],
          handoffs: [],
        }),
      ),
    );
    const { blockers } = readiness(response);
    expect(blockers[0]).toBe('SESSION_NOT_EXCLUSIVE');
    expectBlockerOrder(blockers);
    expect(capabilities(response).canOpenShift).toBe(false);
  });

  it('§5.3/AC-TEAT-012-4 — dado o mesmo turno em outro device **com** ops_session_handoff então o bloqueador é SHIFT_ALREADY_OPEN_ELSEWHERE, nunca SESSION_NOT_EXCLUSIVE', async () => {
    const response = await bootstrap(
      deps(
        world({
          shifts: [
            {
              id: SHIFT_OPEN,
              tenant_id: TENANT_ID,
              traffic_agency_id: AGENCY_ID,
              agent_id: AGENT_ID,
              device_id: DEVICE_BLOCKED,
              operational_unit_id: UNIT_ID,
              started_at: '2026-09-14T12:00:00.000Z',
              status: 'open',
            },
          ],
          handoffs: [
            {
              id: '00000000-0000-7000-8000-0000e3100001',
              tenant_id: TENANT_ID,
              shift_id: SHIFT_OPEN,
              from_agent_id: AGENT_ID,
              to_agent_id: AGENT_ID,
              handed_off_at: '2026-09-14T12:30:00.000Z',
            },
          ],
        }),
      ),
    );
    const { blockers } = readiness(response);
    expect(blockers).toContain('SHIFT_ALREADY_OPEN_ELSEWHERE');
    expect(blockers).not.toContain('SESSION_NOT_EXCLUSIVE');
    expectBlockerOrder(blockers);
  });

  it('§5.3 — dado o agente …b0000002 (functional_status inactive) e sem unidade então blockers traz AGENT_NOT_ACTIVE antes de AGENT_NOT_IN_UNIT', async () => {
    const response = await bootstrap(
      deps(
        world({
          agents: [
            agent({ functional_status: 'inactive', operational_unit_id: null }),
          ],
        }),
      ),
    );
    const { blockers } = readiness(response);
    expectBlockerOrder(blockers);
    expect(blockers).toContain('AGENT_NOT_ACTIVE');
    expect(blockers).toContain('AGENT_NOT_IN_UNIT');
    expect(blockers.indexOf('AGENT_NOT_ACTIVE')).toBeLessThan(
      blockers.indexOf('AGENT_NOT_IN_UNIT'),
    );
  });
});

describe('CTG-0002 §5.6 — handoff de sessão (M10, D-01/AC-TEAT-012-4) (C-0002-26)', () => {
  function withOpenShiftOn(deviceId: string) {
    return deps(
      world({
        shifts: [
          {
            id: SHIFT_OPEN,
            tenant_id: TENANT_ID,
            traffic_agency_id: AGENCY_ID,
            agent_id: AGENT_ID,
            device_id: deviceId,
            operational_unit_id: UNIT_ID,
            started_at: '2026-09-14T08:00:00.000Z',
            status: 'open',
          },
        ],
        reservations: [reservation({ device_id: deviceId })],
      }),
    );
  }

  it('C-0002-26 — dado POST sessions/handoff sem reason então 422 TEAT.VALIDATION_FAILED com fields[0].path = reason', async () => {
    await expect(
      handoff(withOpenShiftOn(DEVICE_BLOCKED), {
        failed_device_id: DEVICE_BLOCKED,
        reason: '',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 422,
      context: expect.objectContaining({
        fields: [expect.objectContaining({ path: 'reason', rule: 'required' })],
      }),
    });
  });

  it('C-0002-26 — dado POST sessions/handoff com reason então o handoff é gravado, a reserva do device falho vai a cancelled e ops_shift.device_id passa ao novo device', async () => {
    const dependencies = withOpenShiftOn(DEVICE_BLOCKED);
    const response = await handoff(dependencies, {
      failed_device_id: DEVICE_BLOCKED,
      reason: 'Falha de bateria do coletor em campo',
      new_device_id: DEVICE_AUTHORIZED,
    });
    expect(response).toMatchObject({
      shift_id: SHIFT_OPEN,
      failed_device_id: DEVICE_BLOCKED,
      new_device_id: DEVICE_AUTHORIZED,
    });
    expect(dependencies.repositories.handoffs.rows).toContainEqual(
      expect.objectContaining({
        shift_id: SHIFT_OPEN,
        from_agent_id: AGENT_ID,
        to_agent_id: AGENT_ID,
      }),
    );
    expect(dependencies.repositories.deviceEvents.rows).toContainEqual(
      expect.objectContaining({ event_type: 'handoff' }),
    );
    expect(
      dependencies.repositories.reservations.rows.map((row) => row.status),
    ).toEqual(['cancelled']);
    expect(response.cancelled_reservations).toEqual([RESERVATION_RESERVED]);
    expect(
      dependencies.repositories.shifts.rows.find((row) => row.id === SHIFT_OPEN)
        ?.device_id,
    ).toBe(DEVICE_AUTHORIZED);
  });

  it('§5.6 — dado nenhum turno open do agente no failed_device_id então 409 TEAT.SHIFT_NOT_OPEN', async () => {
    await expect(
      handoff(deps(world({ shifts: [] })), {
        failed_device_id: DEVICE_BLOCKED,
        reason: 'Falha de bateria do coletor em campo',
      }),
    ).rejects.toMatchObject({ code: 'TEAT.SHIFT_NOT_OPEN', status: 409 });
  });

  it('§5.6 — dado new_device_id com tamper_flag então 403 TEAT.DEVICE_TAMPER_DETECTED com deviceId e status', async () => {
    await expect(
      handoff(withOpenShiftOn(DEVICE_BLOCKED), {
        failed_device_id: DEVICE_BLOCKED,
        reason: 'Falha de bateria do coletor em campo',
        new_device_id: DEVICE_TAMPERED,
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.DEVICE_TAMPER_DETECTED',
      status: 403,
      context: expect.objectContaining({ deviceId: DEVICE_TAMPERED }),
    });
  });
});
