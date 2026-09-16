import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * CTG-0003 §4.2 e §10 (R-0008, TASK-0006) — C-0003-06, C-0003-07 e a fração de
 * `complete-upload` de C-0003-08: `POST
 * /v1/ops/evidence/{id}/complete-upload` (M11). `handwritten/complete-upload.command.ts`
 * nasce em TASK-0007. Ids das fixtures: `27-fixtures-teat-evidence.sql`
 * (`…ef000002` pending_upload + intenção `…ef100001` vencida em
 * 2026-09-01, `…ef000004` quarantined). Relógio fixo em 2026-09-14 (CTG-0003
 * §9).
 *
 * Nome esperado do export: `CompleteUploadCommand`, construtor `(deps)`,
 * método `execute`.
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const EVIDENCE_PENDING = '00000000-0000-7000-8000-0000ef000002';
const STORAGE_INTENT_EXPIRED = '00000000-0000-7000-8000-0000ef100001';
const EVIDENCE_QUARANTINED = '00000000-0000-7000-8000-0000ef000004';
const NOW = '2026-09-14T14:00:00.000Z';
const HASH_VALUE =
  'sha256:531986dca23b52cea07f5b3a736b452efea3ff325033daa19fb218741cb4875d';

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
          id: EVIDENCE_PENDING,
          tenant_id: TENANT_ID,
          status: 'pending_upload',
          hash_value: HASH_VALUE,
        },
        {
          id: EVIDENCE_QUARANTINED,
          tenant_id: TENANT_ID,
          status: 'quarantined',
          hash_value:
            'sha256:a8949cf99ae3fc2328f8acf858aefca10282ab574addc442698fed3e9929cc98',
        },
      ]),
      storageIntents: repository([
        {
          id: STORAGE_INTENT_EXPIRED,
          tenant_id: TENANT_ID,
          evidence_id: EVIDENCE_PENDING,
          expires_at: '2026-09-01T00:00:00-04:00',
          status: 'pending',
        },
      ]),
      evidenceLinks: repository(),
      custodyEvents: repository(),
      ...(overrides.repositories ?? {}),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => NOW },
  };
}

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function completeUpload(
  dependencies: Deps,
  evidenceId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./complete-upload.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'ops/evidence/src/handwritten/complete-upload.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
      { cause },
    );
  }
  const exported =
    (loaded.CompleteUploadCommand as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'complete-upload.command.ts não exporta um comando construtível (CTG-0003 §11)',
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
      'complete-upload.command.ts não expõe execute|handle|run (CTG-0003 §4.2)',
    );
  }
  return (await (
    method as (id: string, value: unknown) => Promise<unknown>
  ).call(command, evidenceId, body)) as Record<string, unknown>;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CTG-0003 §4.2 — complete-upload: intenção vencida, hash divergente e quarentena (C-0003-06…08)', () => {
  it('C-0003-06 — dada a evidência …ef000002 com a intenção …ef100001 expirada quando complete-upload então 410 TEAT.EVIDENCE_INTENT_EXPIRED com { storageIntentId, expiresAt }, relógio fixo em 2026-09-14', async () => {
    const dependencies = deps();
    await expect(
      completeUpload(dependencies, EVIDENCE_PENDING, {
        storage_intent_id: STORAGE_INTENT_EXPIRED,
        idempotency_key: 'complete-001',
        entity_type: 'ait',
        entity_id: '00000000-0000-7000-8000-0000f0000001',
        accepted_hash: HASH_VALUE,
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.EVIDENCE_INTENT_EXPIRED',
      status: 410,
      context: expect.objectContaining({
        storageIntentId: STORAGE_INTENT_EXPIRED,
        expiresAt: expect.any(String),
      }),
    });
  });

  it('C-0003-07 — dado complete-upload com accepted_hash ≠ hash_value então 422 TEAT.EVIDENCE_HASH_MISMATCH com { declaredHash, acceptedHash }', async () => {
    const dependencies = deps({
      repositories: {
        evidence: repository([
          {
            id: EVIDENCE_PENDING,
            tenant_id: TENANT_ID,
            status: 'pending_upload',
            hash_value: HASH_VALUE,
          },
        ]),
        storageIntents: repository([
          {
            id: STORAGE_INTENT_EXPIRED,
            tenant_id: TENANT_ID,
            evidence_id: EVIDENCE_PENDING,
            expires_at: '2027-01-01T00:00:00-04:00',
            status: 'pending',
          },
        ]),
        evidenceLinks: repository(),
        custodyEvents: repository(),
      },
    });
    await expect(
      completeUpload(dependencies, EVIDENCE_PENDING, {
        storage_intent_id: STORAGE_INTENT_EXPIRED,
        idempotency_key: 'complete-002',
        entity_type: 'ait',
        entity_id: '00000000-0000-7000-8000-0000f0000001',
        accepted_hash:
          'sha256:1111111111111111111111111111111111111111111111111111111111111111',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.EVIDENCE_HASH_MISMATCH',
      status: 422,
      context: expect.objectContaining({
        declaredHash: HASH_VALUE,
        acceptedHash: expect.any(String),
      }),
    });
  });

  it('C-0003-08a — dada a evidência …ef000004 (quarantined) quando complete-upload então 409 TEAT.EVIDENCE_QUARANTINED, e esse código precede a guarda de estado', async () => {
    const dependencies = deps();
    await expect(
      completeUpload(dependencies, EVIDENCE_QUARANTINED, {
        storage_intent_id: STORAGE_INTENT_EXPIRED,
        idempotency_key: 'complete-003',
        entity_type: 'ait',
        entity_id: '00000000-0000-7000-8000-0000f0000001',
        accepted_hash:
          'sha256:a8949cf99ae3fc2328f8acf858aefca10282ab574addc442698fed3e9929cc98',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.EVIDENCE_QUARANTINED',
      status: 409,
    });
  });
});

/**
 * CTG-0003 §14 item 1 (adenda do maestro, 2026-09-16, delivery-review ciclo 1
 * achado §14.1) — TASK-0006 iteração 3: `complete-upload` valida o DTO
 * inteiro (não só `accepted_hash`/`storage_intent_id`), detecta
 * `entity_type`/`entity_id` divergentes da intenção e `idempotency_key`
 * fora da intenção gravada.
 *
 * Escrito em paralelo à iteração 3 do Engineer: no momento em que este
 * arquivo foi finalizado, `complete-upload.command.ts` já traz `parse()`
 * (400 `TEAT.VALIDATION_FAILED` para forma do DTO) e `assertMatchesIntent()`
 * (409 `TEAT.EVIDENCE_ENTITY_NOT_APPLIED`/`TEAT.IDEMPOTENCY_REPLAY`), e
 * `evidence-runtime.ts` já distingue `validationFailed(fields, 400)` de forma
 * de `validationFailed(fields)` (422, default) de regra de negócio —
 * fechando a divergência de status do achado. O par `entity_type`/
 * `entity_id` declarado na intenção é gravado por `initiate-upload` em
 * `evidence.metadata_json.upload_entity_type`/`upload_entity_id` (mesma
 * decisão de OD-T55); os mocks abaixo replicam esse formato. Mantido como
 * teste de regressão desta tarefa (TASK-0006 iteração 3), não como
 * suposição — a implementação real foi lida antes de fechar os casos.
 */
describe('CTG-0003 §14.1 — complete-upload: DTO completo, divergência de entidade e replay de chave', () => {
  const VALID_ENTITY_ID = '00000000-0000-7000-8000-0000f0000001';
  const OTHER_ENTITY_ID = '00000000-0000-7000-8000-0000f0000099';

  function fullBody(overrides: Record<string, unknown> = {}) {
    return {
      storage_intent_id: STORAGE_INTENT_EXPIRED,
      idempotency_key: 'intent-002',
      entity_type: 'ait',
      entity_id: VALID_ENTITY_ID,
      accepted_hash: HASH_VALUE,
      ...overrides,
    };
  }

  function depsWithFutureIntent(): Deps {
    return deps({
      repositories: {
        evidence: repository([
          {
            id: EVIDENCE_PENDING,
            tenant_id: TENANT_ID,
            status: 'pending_upload',
            hash_value: HASH_VALUE,
            metadata_json: {
              upload_entity_type: 'ait',
              upload_entity_id: VALID_ENTITY_ID,
            },
          },
        ]),
        storageIntents: repository([
          {
            id: STORAGE_INTENT_EXPIRED,
            tenant_id: TENANT_ID,
            evidence_id: EVIDENCE_PENDING,
            // idempotency_key gravado na intenção (§4.1): a mesma coluna que
            // `ux_storage_intent_tenant_id_idempotency_key` já indexa.
            idempotency_key: 'intent-002',
            expires_at: '2027-01-01T00:00:00-04:00',
            status: 'pending',
          },
        ]),
        evidenceLinks: repository(),
        custodyEvents: repository(),
      },
    });
  }

  function assertNothingChanged(dependencies: Deps): void {
    expect(
      dependencies.repositories.evidence.rows.find(
        (row) => row.id === EVIDENCE_PENDING,
      )?.status,
    ).toBe('pending_upload');
    expect(dependencies.repositories.custodyEvents.rows).toEqual([]);
    expect(dependencies.repositories.evidenceLinks.rows).toEqual([]);
  }

  it('dado idempotency_key ausente então 400 TEAT.VALIDATION_FAILED com fields contendo { path: "idempotency_key", rule: "required" }, e nada persistido', async () => {
    const dependencies = depsWithFutureIntent();
    const body = fullBody();
    delete (body as Record<string, unknown>).idempotency_key;
    await expect(
      completeUpload(dependencies, EVIDENCE_PENDING, body),
    ).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 400,
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({
            path: 'idempotency_key',
            rule: 'required',
          }),
        ]),
      }),
    });
    assertNothingChanged(dependencies);
  });

  it('dado entity_type ≠ "ait" então 400 TEAT.VALIDATION_FAILED com fields contendo { path: "entity_type", rule: "enum" }, e nada persistido', async () => {
    const dependencies = depsWithFutureIntent();
    await expect(
      completeUpload(
        dependencies,
        EVIDENCE_PENDING,
        fullBody({ entity_type: 'boat' }),
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 400,
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ path: 'entity_type', rule: 'enum' }),
        ]),
      }),
    });
    assertNothingChanged(dependencies);
  });

  it('dado entity_id inválido (não uuid) então 400 TEAT.VALIDATION_FAILED com fields contendo { path: "entity_id", rule: "uuid" }, e nada persistido', async () => {
    const dependencies = depsWithFutureIntent();
    await expect(
      completeUpload(
        dependencies,
        EVIDENCE_PENDING,
        fullBody({ entity_id: 'not-a-uuid' }),
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 400,
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ path: 'entity_id', rule: 'uuid' }),
        ]),
      }),
    });
    assertNothingChanged(dependencies);
  });

  it('dado entity_type/entity_id divergentes da intenção gravada então 409 TEAT.EVIDENCE_ENTITY_NOT_APPLIED com { evidenceId, entityType, entityId }, e nada persistido', async () => {
    const dependencies = depsWithFutureIntent();
    await expect(
      completeUpload(
        dependencies,
        EVIDENCE_PENDING,
        fullBody({ entity_id: OTHER_ENTITY_ID }),
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.EVIDENCE_ENTITY_NOT_APPLIED',
      status: 409,
      context: expect.objectContaining({
        evidenceId: EVIDENCE_PENDING,
        entityType: 'ait',
        entityId: OTHER_ENTITY_ID,
      }),
    });
    assertNothingChanged(dependencies);
  });

  it('dado idempotency_key ≠ da intenção gravada então 409 TEAT.IDEMPOTENCY_REPLAY com { idempotencyKey }, e nada persistido', async () => {
    const dependencies = depsWithFutureIntent();
    await expect(
      completeUpload(
        dependencies,
        EVIDENCE_PENDING,
        fullBody({ idempotency_key: 'outra-chave-diferente' }),
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.IDEMPOTENCY_REPLAY',
      status: 409,
      context: expect.objectContaining({
        idempotencyKey: 'outra-chave-diferente',
      }),
    });
    assertNothingChanged(dependencies);
  });
});
