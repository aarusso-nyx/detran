import { describe, expect, it, vi } from 'vitest';

/**
 * CTG-0003 §4.9/§4.10/§4.11 e §10 (R-0008, TASK-0006) — C-0003-12 e
 * C-0003-13: `create-access-request.command.ts` e
 * `decide-access-request.command.ts`/`deliver-access-request.command.ts`
 * (RN-TEAT-142). Nascem em TASK-0007. Ids das fixtures
 * (`27-fixtures-teat-evidence.sql`): `…ef400001` (`requested`), `…ef400002`
 * (`approved`).
 *
 * Nomes esperados dos exports: `CreateAccessRequestCommand`,
 * `DecideAccessRequestCommand`, `DeliverAccessRequestCommand` — construtor
 * `(deps)`, método `execute`.
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const EVIDENCE_BODYCAM = '00000000-0000-7000-8000-0000ef000001';
const ACCESS_REQUESTED = '00000000-0000-7000-8000-0000ef400001';
const ACCESS_APPROVED = '00000000-0000-7000-8000-0000ef400002';

/** RN-TEAT-142, art. 13: rol fechado de requerentes legítimos. */
const REQUESTER_ROLES = [
  'magistrado',
  'ministerio-publico',
  'defensoria-publica',
  'autoridade-policial',
  'autoridade-administrativa',
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
      accessRequests: repository([
        {
          id: ACCESS_REQUESTED,
          tenant_id: TENANT_ID,
          evidence_id: EVIDENCE_BODYCAM,
          status: 'requested',
        },
        {
          id: ACCESS_APPROVED,
          tenant_id: TENANT_ID,
          evidence_id: EVIDENCE_BODYCAM,
          status: 'approved',
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

async function loadCommand(
  specifier: string,
  file: string,
  primaryExport: string,
  dependencies: Deps,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule(specifier)) as Record<string, unknown>;
  } catch (cause) {
    throw new Error(
      `ops/evidence/src/handwritten/${file} ainda não existe (TASK-0007, CTG-0003 §11)`,
      { cause },
    );
  }
  const exported =
    (loaded[primaryExport] as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      `${file} não exporta um comando construtível (CTG-0003 §11)`,
    );
  }
  const Command = exported as new (
    dependencies: unknown,
  ) => Record<string, unknown>;
  return new Command(dependencies);
}

async function invoke(
  command: Record<string, unknown>,
  file: string,
  ...args: unknown[]
): Promise<Record<string, unknown>> {
  const method = ['execute', 'handle', 'run']
    .map((name) => command[name])
    .find((value) => typeof value === 'function');
  if (typeof method !== 'function') {
    throw new Error(`${file} não expõe execute|handle|run`);
  }
  return (await (method as (...values: unknown[]) => Promise<unknown>).apply(
    command,
    args,
  )) as Record<string, unknown>;
}

describe('CTG-0003 §4.9 — create-access-request: rol de requerentes (C-0003-12)', () => {
  it('C-0003-12 — dado evidence-access-requests com requester_role=perito então 422 TEAT.EVIDENCE_ACCESS_REQUESTER_NOT_IN_ROL com context.allowed = os cinco papéis do art. 13', async () => {
    const dependencies = deps();
    const command = await loadCommand(
      './create-access-request.command.js',
      'create-access-request.command.ts',
      'CreateAccessRequestCommand',
      dependencies,
    );
    await expect(
      invoke(command, 'create-access-request.command.ts', {
        evidence_id: EVIDENCE_BODYCAM,
        requester_name: 'Perito Fixture',
        requester_role: 'perito',
        purpose: 'perícia',
        investigation_ref: 'INV-0001',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.EVIDENCE_ACCESS_REQUESTER_NOT_IN_ROL',
      status: 422,
      context: expect.objectContaining({
        requesterRole: 'perito',
        allowed: expect.arrayContaining([...REQUESTER_ROLES]),
      }),
    });
  });

  it.each(REQUESTER_ROLES)(
    'dado requester_role=%s (rol do art. 13) então a requisição nasce requested',
    async (role) => {
      const dependencies = deps();
      const command = await loadCommand(
        './create-access-request.command.js',
        'create-access-request.command.ts',
        'CreateAccessRequestCommand',
        dependencies,
      );
      const response = await invoke(
        command,
        'create-access-request.command.ts',
        {
          evidence_id: EVIDENCE_BODYCAM,
          requester_name: 'Requerente Fixture',
          requester_role: role,
          purpose: 'finalidade declarada',
          investigation_ref: 'INV-0002',
        },
      );
      expect(response.status).toBe('requested');
    },
  );
});

describe('CTG-0003 §4.10/§4.11 — decide/deliver fora de ordem (C-0003-13)', () => {
  it('C-0003-13a — dado o pedido …ef400001 (requested) quando deliver então 409 TEAT.EVIDENCE_ACCESS_STATE_INVALID com allowed:[approved]', async () => {
    const dependencies = deps();
    const command = await loadCommand(
      './deliver-access-request.command.js',
      'deliver-access-request.command.ts',
      'DeliverAccessRequestCommand',
      dependencies,
    );
    await expect(
      invoke(command, 'deliver-access-request.command.ts', ACCESS_REQUESTED, {
        delivery_media_ref: 'DVD-0001',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.EVIDENCE_ACCESS_STATE_INVALID',
      status: 409,
      context: expect.objectContaining({
        requestId: ACCESS_REQUESTED,
        currentState: 'requested',
        allowed: ['approved'],
      }),
    });
  });

  it('C-0003-13b — dado o pedido …ef400002 (approved) quando approve então 409 TEAT.EVIDENCE_ACCESS_STATE_INVALID com allowed:[requested]', async () => {
    const dependencies = deps();
    const command = await loadCommand(
      './decide-access-request.command.js',
      'decide-access-request.command.ts',
      'DecideAccessRequestCommand',
      dependencies,
    );
    await expect(
      invoke(
        command,
        'decide-access-request.command.ts',
        ACCESS_APPROVED,
        'approve',
        { legal_basis: 'Art. 13 da Portaria 003/2026' },
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.EVIDENCE_ACCESS_STATE_INVALID',
      status: 409,
      context: expect.objectContaining({
        requestId: ACCESS_APPROVED,
        currentState: 'approved',
        allowed: ['requested'],
      }),
    });
  });
});
