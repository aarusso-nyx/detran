import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * CTG-0003 §4.1 e §10 (R-0008, TASK-0006) — C-0003-01…05: `POST
 * /v1/ops/evidence/upload-intents` (M11). Nada aqui existe ainda:
 * `handwritten/initiate-upload.command.ts` é criado pelo Engineer em
 * TASK-0007 (CTG-0003 §11). O módulo é carregado por `import()` dinâmico
 * dentro de cada teste para que o arquivo colete e cada caso falhe isolado.
 *
 * Nome esperado do export (precedente CTG-0002 §13.3, citado no prompt desta
 * tarefa): `InitiateUploadCommand`, construtor `(deps)`, método `execute`. O
 * carregador tolera outros nomes plausíveis e cai no primeiro export
 * construtível, para não derrubar o arquivo se o Engineer divergir — a
 * divergência vira nota no relatório, nunca ajuste do teste.
 *
 * Canônico aqui (CTG-0003 §4.1, `teat-error-catalog.md` §6): os códigos de
 * erro, as chaves de `context`, a forma da resposta 201 e a proveniência de
 * `upload_url`/`expires_at` da porta `EvidenceStoragePort` — nunca constante
 * do domínio (M11). Não canônico: o nome do símbolo exportado e a forma do
 * objeto `deps`.
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const AIT_INTEGRADO_ID = '00000000-0000-7000-8000-0000f0000001';
const NOW = '2026-09-14T14:00:00.000Z';

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
  appliedEntityPorts: readonly {
    entityType: string;
    isApplied: ReturnType<typeof vi.fn>;
  }[];
  evidenceStorage: { presignUpload: ReturnType<typeof vi.fn> };
  outbox: { append: ReturnType<typeof vi.fn> };
  clock: { now(): string };
}

function appliedEntityPort(entityType: string, applied = true) {
  return {
    entityType,
    isApplied: vi.fn(async () => applied),
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
      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
    },
    repositories: {
      evidence: repository(),
      storageIntents: repository(),
      ...(overrides.repositories ?? {}),
    },
    appliedEntityPorts: overrides.appliedEntityPorts ?? [
      appliedEntityPort('ait', true),
    ],
    evidenceStorage: overrides.evidenceStorage ?? {
      presignUpload: vi.fn(
        async (input: { objectKey: string }) =>
          ({
            uploadUrl: `local://${input.objectKey}`,
            expiresAt: '2027-01-01T00:00:00.000Z',
          }) as const,
      ),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => NOW },
  };
}

function input(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    traffic_agency_id: AGENCY_ID,
    local_evidence_id: '00000000-0000-7000-8000-0000ef900001',
    idempotency_key: 'upload-intent-001',
    entity_type: 'ait',
    entity_id: AIT_INTEGRADO_ID,
    evidence_type: 'foto',
    origin: 'campo',
    mime_type: 'image/jpeg',
    size_bytes: 204800,
    hash_algorithm: 'sha256',
    hash_value:
      'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    filename: 'foto-001.jpg',
    ...overrides,
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

const COMMAND_EXPORTS = [
  'InitiateUploadCommand',
  'InitiateEvidenceUploadCommand',
] as const;
const COMMAND_METHODS = ['execute', 'handle', 'run'] as const;

async function initiateUpload(
  dependencies: Deps,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./initiate-upload.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'ops/evidence/src/handwritten/initiate-upload.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
      { cause },
    );
  }
  const exported =
    COMMAND_EXPORTS.map((name) => loaded[name]).find(
      (value) => typeof value === 'function',
    ) ?? Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'initiate-upload.command.ts não exporta um comando construtível (CTG-0003 §11)',
    );
  }
  const Command = exported as new (
    dependencies: unknown,
  ) => Record<string, unknown>;
  const command = new Command(dependencies);
  const method = COMMAND_METHODS.map((name) => command[name]).find(
    (value) => typeof value === 'function',
  );
  if (typeof method !== 'function') {
    throw new Error(
      `initiate-upload.command.ts não expõe nenhum de ${COMMAND_METHODS.join('|')} (CTG-0003 §4.1)`,
    );
  }
  return (await (method as (value: unknown) => Promise<unknown>).call(
    command,
    body,
  )) as Record<string, unknown>;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CTG-0003 §4.1 — upload-intents: pré-condições e idempotência (C-0003-01…05)', () => {
  it('C-0003-01 — dado upload-intents sem hash_value então 400 TEAT.EVIDENCE_HASH_REQUIRED', async () => {
    const dependencies = deps();
    const body = input();
    delete body.hash_value;
    await expect(initiateUpload(dependencies, body)).rejects.toMatchObject({
      code: 'TEAT.EVIDENCE_HASH_REQUIRED',
      status: 400,
    });
  });

  it('C-0003-02 — dado entity_type=ait com entity_id que a AppliedEntityPort diz não aplicado então 409 TEAT.EVIDENCE_ENTITY_NOT_APPLIED com { entityType, entityId }', async () => {
    const dependencies = deps({
      appliedEntityPorts: [appliedEntityPort('ait', false)],
    });
    await expect(initiateUpload(dependencies, input())).rejects.toMatchObject({
      code: 'TEAT.EVIDENCE_ENTITY_NOT_APPLIED',
      status: 409,
      context: expect.objectContaining({
        entityType: 'ait',
        entityId: AIT_INTEGRADO_ID,
      }),
    });
  });

  it('C-0003-03 — dado upload-intents repetido com a mesma idempotency_key e o mesmo corpo então a resposta é idêntica e existe uma única storage_intent', async () => {
    const dependencies = deps();
    const body = input();
    const first = await initiateUpload(dependencies, body);
    const second = await initiateUpload(dependencies, body);
    expect(second).toEqual(first);
    expect(dependencies.repositories.storageIntents.rows).toHaveLength(1);
  });

  it('C-0003-04 — dado o mesmo idempotency_key com corpo diferente então 409 TEAT.IDEMPOTENCY_REPLAY', async () => {
    const dependencies = deps();
    await initiateUpload(dependencies, input());
    await expect(
      initiateUpload(dependencies, input({ filename: 'outro-arquivo.jpg' })),
    ).rejects.toMatchObject({
      code: 'TEAT.IDEMPOTENCY_REPLAY',
      status: 409,
    });
  });

  it('C-0003-05 — dado upload-intents bem-sucedido então upload_url e expires_at vêm da porta (local://<object_key> no stub), sem constante de expiração no domínio', async () => {
    const dependencies = deps();
    const response = await initiateUpload(dependencies, input());
    expect(dependencies.evidenceStorage.presignUpload).toHaveBeenCalled();
    expect(response.upload_url).toMatch(/^local:\/\//);
    expect(response.expires_at).toBe('2027-01-01T00:00:00.000Z');
    expect(response.storage_intent_id).toBeDefined();
    expect(response.evidence_id).toBeDefined();
  });
});
