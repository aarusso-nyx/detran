// Inspector — A160-17: inactive pure preparation, no persistence/replay/HTTP proof.
import { describe, expect, it } from 'vitest';

type Result<T = unknown> =
  | { kind: 'prepared'; value: T }
  | { kind: 'protected-platform' }
  | { kind: 'checkpoint'; reason: string };
interface Api {
  classifyR22DomainFailure(failure: unknown, provenance: unknown): Result;
  projectR22RecordedFailureReceipt(facts: unknown, expected: unknown): Result;
  countR22AcceptedReceipts(receipts: unknown): Result<number>;
}
const moduleUrl = new URL(
  './r22-stynx-offline-outcome.preparation.ts',
  import.meta.url,
).href;
const api = async () => (await import(moduleUrl)) as Api;
const provenance = (source = 'failed-item-after-rollback') => ({
  source,
  tenantId: 'tenant-original',
  auditActorId: 'audit-actor-original',
  effectiveAgentId: 'business-agent-original',
  orgUnitId: 'org-original',
  deviceId: 'device-original',
  deviceBatchId: 'device-batch-original',
  queueItemId: 'queue-original',
  receiptId: 'native-receipt-original',
  localEntityId: 'local-original',
  idempotencyKey: 'public-key-original' as string | null,
});
const failure = (code = 'TEAT.SYNC_ITEM_CONFLICT') => ({
  origin: 'consumer-domain',
  code,
});
const facts = () => ({
  origin: 'consumer-domain',
  provenance: provenance('stored-canonical-receipt'),
  status: 'conflict',
  code: 'BOAT.SYNC_DUPLICATE_NATURAL_KEY',
  serverEntityId: 'real-server-original' as string | null,
});
const seven = (status = 'applied') => ({
  local_entity_id: 'local-original',
  idempotency_key: 'public-key-original' as string | null,
  status,
  server_entity_id: 'real-server-original' as string | null,
  error_code: null as string | null,
  error_message: null,
  details_json: null as Record<string, unknown> | null,
});
const context = () => ({
  nested: { empty: null, flag: false, label: 'ação ñ', decimal: 0.1 },
  list: [0, '', true, null, { data: 'ç' }],
  tenantId: 'untrusted-context-tenant',
  actorId: 'untrusted-context-actor',
  agentId: 'untrusted-context-agent',
});
function checkpoint(value: unknown, reason: string) {
  expect(value).toEqual({ kind: 'checkpoint', reason });
}
function freeze(value: unknown, seen = new Set<object>()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  for (const d of Object.values(Object.getOwnPropertyDescriptors(value)))
    if ('value' in d) freeze(d.value, seen);
  Object.freeze(value);
}
const table = [
  ['TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED', 'received', undefined],
  ['TEAT.SYNC_DESTINATION_NOT_WIRED', 'received', undefined],
  ['TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE', 'rejected', undefined],
  ['TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT', 'rejected', 'domain'],
  ['TEAT.NUMBERING_NUMBER_ALREADY_APPLIED', 'rejected', 'domain'],
  ['TEAT.NUMBERING_RESERVATION_EXPIRED', 'conflict', 'domain'],
  ['TEAT.SYNC_ITEM_CONFLICT', 'conflict', 'domain'],
  ['BOAT.SYNC_DUPLICATE_NATURAL_KEY', 'conflict', undefined],
  ['TEAT.SYNC_CONCURRENCY_SUSPECT', 'conflict', 'concurrency'],
  ['UNKNOWN.ORIGINAL.CODE', 'rejected', undefined],
  ['__proto__', 'rejected', undefined],
  ['constructor', 'rejected', undefined],
  [' TEAT.SYNC_ITEM_CONFLICT ', 'rejected', undefined],
  ['teat.sync_item_conflict', 'rejected', undefined],
] as const;

describe('A160-17 independent domain outcome preparation', () => {
  it.each(['', '   '])(
    'preserves legal original public key %j without request admission',
    async (idempotencyKey) => {
      const p = { ...provenance(), idempotencyKey };
      expect(
        (await api()).classifyR22DomainFailure(failure(), p),
      ).toMatchObject({ kind: 'prepared', value: { provenance: p } });
    },
  );
  it.each(table)(
    'preserves exact original table/code %s',
    async (code, status, conflictType) => {
      const p = provenance();
      const descriptions = {
        domain: 'Divergência de negócio requer análise.',
        concurrency:
          'Mesmo agente com atos em dispositivos distintos na mesma janela.',
      };
      expect((await api()).classifyR22DomainFailure(failure(code), p)).toEqual({
        kind: 'prepared',
        value: {
          legacyOutcome: { status, ...(conflictType ? { conflictType } : {}) },
          candidateOutcome: {
            status,
            ...(conflictType
              ? {
                  conflict: {
                    type: conflictType,
                    description: descriptions[conflictType],
                  },
                }
              : {}),
          },
          code,
          provenance: p,
        },
      });
    },
  );
  it('defers original integrity without manufacturing a domain descriptor', async () => {
    checkpoint(
      (await api()).classifyR22DomainFailure(
        failure('TEAT.SYNC_INTEGRITY_ERROR'),
        provenance(),
      ),
      'integrity-path-required',
    );
  });
  it.each([
    'OFFLINE_SYNC',
    'OFFLINE_SYNC_UPGRADE_REQUIRED',
    'OFFLINE_SYNC.NUMBERING',
    'OFFLINE_SYNC_LEASE_LOST',
  ])('protects reserved code %s despite HTTP status', async (code) => {
    expect(
      (await api()).classifyR22DomainFailure(
        { ...failure(code), httpStatus: 409 },
        provenance(),
      ),
    ).toEqual({ kind: 'protected-platform' });
  });
  it('protects platform origin with a domain-looking code and no provenance', async () => {
    expect(
      (await api()).classifyR22DomainFailure(
        { origin: 'platform', code: 'TEAT.SYNC_ITEM_CONFLICT' },
        undefined,
      ),
    ).toEqual({ kind: 'protected-platform' });
  });
  it.each([undefined, '', '   '])(
    'refuses unavailable original code %s',
    async (code) => {
      checkpoint(
        (await api()).classifyR22DomainFailure(
          { origin: 'consumer-domain', code },
          provenance(),
        ),
        'original-code-unavailable',
      );
    },
  );
  it('refuses absent code rather than synthesizing one from message', async () => {
    checkpoint(
      (await api()).classifyR22DomainFailure(
        { origin: 'consumer-domain' },
        provenance(),
      ),
      'original-code-unavailable',
    );
  });
  it.each([null, 409, {}, 'a'.repeat(256), 'é'.repeat(128), '\ud800'])(
    'refuses malformed original code %#',
    async (code) => {
      checkpoint(
        (await api()).classifyR22DomainFailure(
          { origin: 'consumer-domain', code },
          provenance(),
        ),
        'invalid-original-data',
      );
    },
  );
  it('accepts exactly 255 UTF-8 bytes without replacing the code', async () => {
    const code = `${'é'.repeat(127)}a`;
    const result = (await api()).classifyR22DomainFailure(
      failure(code),
      provenance(),
    );
    expect(result).toMatchObject({
      kind: 'prepared',
      value: { code, candidateOutcome: { status: 'rejected' } },
    });
  });
  it.each([99, 600, 409.5, '409', null])(
    'refuses invalid optional HTTP fact %s',
    async (httpStatus) => {
      checkpoint(
        (await api()).classifyR22DomainFailure(
          { ...failure(), httpStatus },
          provenance(),
        ),
        'invalid-original-data',
      );
    },
  );
  it.each([100, 409, 599])(
    'HTTP %s does not override a received business outcome',
    async (httpStatus) => {
      expect(
        (await api()).classifyR22DomainFailure(
          { ...failure('TEAT.SYNC_DESTINATION_NOT_WIRED'), httpStatus },
          provenance(),
        ),
      ).toMatchObject({
        kind: 'prepared',
        value: { candidateOutcome: { status: 'received' } },
      });
    },
  );
  it.each(['message', 'applier', 'transaction', 'status', 'then'])(
    'refuses unknown failure field %s',
    async (key) => {
      checkpoint(
        (await api()).classifyR22DomainFailure(
          { ...failure(), [key]: 'applied' },
          provenance(),
        ),
        'invalid-original-data',
      );
    },
  );
  it.each(Object.keys(provenance()))(
    'refuses missing provenance %s without fallback',
    async (key) => {
      const p: Record<string, unknown> = provenance();
      delete p[key];
      checkpoint(
        (await api()).classifyR22DomainFailure(failure(), p),
        'missing-provenance',
      );
    },
  );
  it.each(['tenantId', 'effectiveAgentId', 'auditActorId', 'receiptId'])(
    'refuses malformed provenance %s',
    async (key) => {
      checkpoint(
        (await api()).classifyR22DomainFailure(failure(), {
          ...provenance(),
          [key]: null,
        }),
        'invalid-original-data',
      );
    },
  );
  it('does not use stored replay facts as a newly failed effect', async () => {
    checkpoint(
      (await api()).classifyR22DomainFailure(
        failure(),
        provenance('stored-canonical-receipt'),
      ),
      'stored-replay-required',
    );
  });
  it('accepts explicitly null public key and legitimately equal agent/actor', async () => {
    const p = {
      ...provenance(),
      effectiveAgentId: 'audit-actor-original',
      idempotencyKey: null,
    };
    expect((await api()).classifyR22DomainFailure(failure(), p)).toMatchObject({
      kind: 'prepared',
      value: { provenance: p },
    });
  });
  it('detaches legal context/provenance with actor and agent retaining their actual sources', async () => {
    const p = provenance();
    const c = context();
    const input = { ...failure(), context: c };
    const result = (await api()).classifyR22DomainFailure(input, p);
    expect(result).toMatchObject({
      kind: 'prepared',
      value: { context: c, provenance: p },
    });
    if (result.kind !== 'prepared') throw new Error('Expected prepared');
    const value = result.value as {
      context: ReturnType<typeof context>;
      provenance: ReturnType<typeof provenance>;
    };
    c.nested.label = 'mutated input';
    p.auditActorId = 'mutated input';
    expect(value.context.nested.label).toBe('ação ñ');
    expect(value.provenance.auditActorId).toBe('audit-actor-original');
    value.context.nested.flag = true;
    value.provenance.effectiveAgentId = 'mutated result';
    expect(c.nested.flag).toBe(false);
    expect(p.effectiveAgentId).toBe('business-agent-original');
  });
  it('handles frozen input without mutation', async () => {
    const f = { ...failure(), context: context() };
    const p = provenance();
    const before = JSON.stringify([f, p]);
    freeze(f);
    freeze(p);
    expect((await api()).classifyR22DomainFailure(f, p).kind).toBe('prepared');
    expect(JSON.stringify([f, p])).toBe(before);
  });
  it.each([
    null,
    [],
    new Date(),
    { stynx: {} },
    { x: NaN },
    { x: Infinity },
    { x: undefined },
    { x: 1n },
    { x: Symbol('x') },
    { x: () => 1 },
    {
      toJSON() {
        throw new Error('must not call');
      },
    },
  ])('refuses invalid context %#', async (c) => {
    checkpoint(
      (await api()).classifyR22DomainFailure(
        { ...failure(), context: c },
        provenance(),
      ),
      'invalid-original-data',
    );
  });
  it('refuses cyclic context', async () => {
    const c: Record<string, unknown> = {};
    c.self = c;
    checkpoint(
      (await api()).classifyR22DomainFailure(
        { ...failure(), context: c },
        provenance(),
      ),
      'invalid-original-data',
    );
  });
  it('preserves finite represented JSON numbers and null-prototype data keys', async () => {
    const c = Object.assign(Object.create(null) as Record<string, unknown>, {
      toJSON: 'data',
      number: Number.MAX_SAFE_INTEGER + 1,
    });
    Object.defineProperty(c, '__proto__', {
      value: { data: true },
      enumerable: true,
    });
    expect(
      (await api()).classifyR22DomainFailure(
        { ...failure(), context: c },
        provenance(),
      ),
    ).toMatchObject({ kind: 'prepared', value: { context: c } });
  });
  it('accepts 4096 JSON UTF-8 bytes and refuses 4097', async () => {
    const mapper = await api();
    const exact = { x: 'a'.repeat(4088) };
    expect(Buffer.byteLength(JSON.stringify(exact))).toBe(4096);
    expect(
      mapper.classifyR22DomainFailure(
        { ...failure(), context: exact },
        provenance(),
      ).kind,
    ).toBe('prepared');
    checkpoint(
      mapper.classifyR22DomainFailure(
        { ...failure(), context: { x: `${exact.x}a` } },
        provenance(),
      ),
      'invalid-original-data',
    );
  });
  it.each(['failure', 'provenance', 'context'])(
    'does not execute a getter on %s',
    async (where) => {
      let reads = 0;
      const f: Record<string, unknown> = failure();
      const p: Record<string, unknown> = provenance();
      const c: Record<string, unknown> = {};
      f.context = c;
      const host = where === 'failure' ? f : where === 'provenance' ? p : c;
      Object.defineProperty(
        host,
        where === 'failure'
          ? 'code'
          : where === 'provenance'
            ? 'effectiveAgentId'
            : 'x',
        {
          enumerable: true,
          get() {
            reads++;
            throw new Error('getter executed');
          },
        },
      );
      checkpoint(
        (await api()).classifyR22DomainFailure(f, p),
        'invalid-original-data',
      );
      expect(reads).toBe(0);
    },
  );
  it('refuses a Promise envelope without awaiting it', async () => {
    checkpoint(
      (await api()).classifyR22DomainFailure(
        Promise.resolve(failure()),
        provenance(),
      ),
      'invalid-original-data',
    );
  });
});

describe('A160-17 canonical failure receipt transport', () => {
  it.each(['', '   '])(
    'preserves recorded original key %j',
    async (idempotencyKey) => {
      const f = facts();
      f.provenance.idempotencyKey = idempotencyKey;
      expect(
        (await api()).projectR22RecordedFailureReceipt(f, f.provenance),
      ).toMatchObject({
        kind: 'prepared',
        value: { idempotency_key: idempotencyKey },
      });
    },
  );
  it.each(['', '   '])(
    'preserves recorded failure server identity %j',
    async (serverEntityId) => {
      const f = { ...facts(), serverEntityId };
      expect(
        (await api()).projectR22RecordedFailureReceipt(f, f.provenance),
      ).toMatchObject({
        kind: 'prepared',
        value: { server_entity_id: serverEntityId },
      });
    },
  );
  it('does not trim original public keys to make mismatched source facts agree', async () => {
    const f = facts();
    f.provenance.idempotencyKey = 'public-key-original ';
    checkpoint(
      (await api()).projectR22RecordedFailureReceipt(f, {
        ...f.provenance,
        idempotencyKey: 'public-key-original',
      }),
      'source-identity-mismatch',
    );
  });
  it.each(['serverEntityId', 'provenance', 'code'])(
    'refuses unavailable required canonical fact %s',
    async (key) => {
      const f: Record<string, unknown> = facts();
      delete f[key];
      expect(
        (await api()).projectR22RecordedFailureReceipt(
          f,
          provenance('stored-canonical-receipt'),
        ).kind,
      ).toBe('checkpoint');
    },
  );
  it('requires independently expected canonical provenance', async () => {
    expect(
      (await api()).projectR22RecordedFailureReceipt(facts(), undefined).kind,
    ).toBe('checkpoint');
  });
  it('protects platform-origin canonical facts with a domain-looking code', async () => {
    const f = { ...facts(), origin: 'platform' };
    expect(
      (await api()).projectR22RecordedFailureReceipt(f, f.provenance),
    ).toEqual({ kind: 'protected-platform' });
  });
  it.each(['received', 'rejected', 'conflict'])(
    'preserves original %s rather than rerunning the code table',
    async (status) => {
      const f = { ...facts(), status, context: context() };
      expect(
        (await api()).projectR22RecordedFailureReceipt(f, f.provenance),
      ).toEqual({
        kind: 'prepared',
        value: {
          local_entity_id: 'local-original',
          idempotency_key: 'public-key-original',
          status,
          server_entity_id: 'real-server-original',
          error_code: 'BOAT.SYNC_DUPLICATE_NATURAL_KEY',
          error_message: null,
          details_json: context(),
        },
      });
    },
  );
  it('preserves explicit server/key nulls and absent context as exactly seven fields', async () => {
    const f = facts();
    f.serverEntityId = null;
    f.provenance.idempotencyKey = null;
    expect(
      (await api()).projectR22RecordedFailureReceipt(f, { ...f.provenance }),
    ).toEqual({
      kind: 'prepared',
      value: {
        local_entity_id: 'local-original',
        idempotency_key: null,
        status: 'conflict',
        server_entity_id: null,
        error_code: 'BOAT.SYNC_DUPLICATE_NATURAL_KEY',
        error_message: null,
        details_json: null,
      },
    });
  });
  it.each(Object.keys(provenance()).filter((key) => key !== 'source'))(
    'refuses expected canonical identity mismatch %s',
    async (key) => {
      const f = facts();
      checkpoint(
        (await api()).projectR22RecordedFailureReceipt(f, {
          ...f.provenance,
          [key]: 'different-original-fact',
        }),
        'source-identity-mismatch',
      );
    },
  );
  it('requires stored source rather than calculated candidate', async () => {
    const f = facts();
    f.provenance.source = 'failed-item-after-rollback';
    checkpoint(
      (await api()).projectR22RecordedFailureReceipt(f, f.provenance),
      'stored-replay-required',
    );
  });
  it.each(['applied', 'pending', null, 'unknown'])(
    'refuses failure receipt status %s',
    async (status) => {
      const f = { ...facts(), status };
      checkpoint(
        (await api()).projectR22RecordedFailureReceipt(f, f.provenance),
        'invalid-original-data',
      );
    },
  );
  it('protects reserved platform code on canonical replay', async () => {
    const f = { ...facts(), code: 'OFFLINE_SYNC_UPGRADE_REQUIRED' };
    expect(
      (await api()).projectR22RecordedFailureReceipt(f, f.provenance),
    ).toEqual({ kind: 'protected-platform' });
  });
  it('defers integrity canonical facts without relabeling them', async () => {
    const f = { ...facts(), code: 'TEAT.SYNC_INTEGRITY_ERROR' };
    checkpoint(
      (await api()).projectR22RecordedFailureReceipt(f, f.provenance),
      'integrity-path-required',
    );
  });
  it('validates actual terminal received facts without adding marker fields', async () => {
    const f = {
      ...facts(),
      status: 'received',
      terminalReceived: true,
      retryable: false,
    };
    const result = (await api()).projectR22RecordedFailureReceipt(
      f,
      f.provenance,
    );
    expect(result.kind).toBe('prepared');
    if (result.kind !== 'prepared') throw new Error('Expected prepared');
    expect(Object.keys(result.value as object).sort()).toEqual(
      Object.keys(seven()).sort(),
    );
  });
  it.each([
    { status: 'received', terminalReceived: false, retryable: false },
    { status: 'received', terminalReceived: true, retryable: true },
    { status: 'received', terminalReceived: true },
    { status: 'conflict', terminalReceived: true, retryable: false },
    { status: 'received', terminalReceived: null, retryable: false },
  ])('refuses contradictory terminal marker %#', async (marker) => {
    const f = { ...facts(), ...marker };
    checkpoint(
      (await api()).projectR22RecordedFailureReceipt(f, f.provenance),
      'invalid-original-data',
    );
  });
  it('does not manufacture terminalReceived when both marker facts are absent', async () => {
    const f = { ...facts(), status: 'received' };
    const result = (await api()).projectR22RecordedFailureReceipt(
      f,
      f.provenance,
    );
    expect(result.kind).toBe('prepared');
    if (result.kind === 'prepared')
      expect(result.value).not.toHaveProperty('terminalReceived');
  });
  it.each([true, false])(
    'does not infer terminal marker from retryable %s',
    async (retryable) => {
      const f = { ...facts(), status: 'received', retryable };
      const result = (await api()).projectR22RecordedFailureReceipt(
        f,
        f.provenance,
      );
      expect(result.kind).toBe('prepared');
      if (result.kind === 'prepared')
        expect(result.value).not.toHaveProperty('terminalReceived');
    },
  );
  it('detaches receipt context without invoking getters or mutating source', async () => {
    const c = context();
    const f = { ...facts(), context: c };
    const result = (await api()).projectR22RecordedFailureReceipt(
      f,
      f.provenance,
    );
    if (result.kind !== 'prepared') throw new Error('Expected prepared');
    const value = result.value as { details_json: ReturnType<typeof context> };
    c.nested.label = 'changed';
    expect(value.details_json.nested.label).toBe('ação ñ');
    value.details_json.nested.flag = true;
    expect(c.nested.flag).toBe(false);
  });
  it('refuses receipt accessor without executing it', async () => {
    let reads = 0;
    const f = facts();
    Object.defineProperty(f, 'serverEntityId', {
      enumerable: true,
      get() {
        reads++;
        throw new Error('getter executed');
      },
    });
    checkpoint(
      (await api()).projectR22RecordedFailureReceipt(f, f.provenance),
      'invalid-original-data',
    );
    expect(reads).toBe(0);
  });
  it('refuses receipt extras rather than emitting an envelope', async () => {
    const f = {
      ...facts(),
      batchServerId: 'invented',
      errorMessage: 'exception message',
    };
    checkpoint(
      (await api()).projectR22RecordedFailureReceipt(f, f.provenance),
      'invalid-original-data',
    );
  });
});

describe('A160-17 accepted count from closed projected receipts', () => {
  it.each([{ x: NaN }, [], { x: undefined }])(
    'refuses malformed projected details %#',
    async (details_json) => {
      checkpoint(
        (await api()).countR22AcceptedReceipts([{ ...seven(), details_json }]),
        'invalid-original-data',
      );
    },
  );
  it('counts applied and received, not input length or all four receipts', async () => {
    expect(
      (await api()).countR22AcceptedReceipts(
        ['applied', 'received', 'rejected', 'conflict'].map((status) => ({
          ...seven(status),
          error_code: status === 'applied' ? null : 'ORIGINAL.CODE',
        })),
      ),
    ).toEqual({ kind: 'prepared', value: 2 });
  });
  it('counts no receipts as zero', async () => {
    expect((await api()).countR22AcceptedReceipts([])).toEqual({
      kind: 'prepared',
      value: 0,
    });
  });
  it('validates projected schema without inventing additional success invariants', async () => {
    const r = {
      ...seven(),
      local_entity_id: null,
      idempotency_key: null,
      server_entity_id: null,
      error_code: 'original-code',
      error_message: 'original-message',
      details_json: { data: true },
    };
    expect((await api()).countR22AcceptedReceipts([r])).toEqual({
      kind: 'prepared',
      value: 1,
    });
  });
  it.each(['applied', 'received', 'rejected', 'conflict'])(
    'counts canonical state %s',
    async (status) => {
      expect(
        (await api()).countR22AcceptedReceipts([
          {
            ...seven(status),
            error_code: status === 'applied' ? null : 'ORIGINAL.CODE',
          },
        ]),
      ).toEqual({
        kind: 'prepared',
        value: status === 'applied' || status === 'received' ? 1 : 0,
      });
    },
  );
  it.each(['pending', 'unknown', null, undefined])(
    'refuses nonclosed count state %s',
    async (status) => {
      checkpoint(
        (await api()).countR22AcceptedReceipts([{ ...seven(), status }]),
        'invalid-original-data',
      );
    },
  );
  it.each([null, undefined, {}, 3, [null], new Array(1)])(
    'refuses malformed receipt list %#',
    async (input) => {
      checkpoint(
        (await api()).countR22AcceptedReceipts(input),
        'invalid-original-data',
      );
    },
  );
  it.each(Object.keys(seven()))(
    'refuses missing projected field %s',
    async (key) => {
      const r: Record<string, unknown> = seven();
      delete r[key];
      checkpoint(
        (await api()).countR22AcceptedReceipts([r]),
        'invalid-original-data',
      );
    },
  );
  it('refuses an extra native acceptedItems field', async () => {
    checkpoint(
      (await api()).countR22AcceptedReceipts([
        { ...seven(), acceptedItems: 999 },
      ]),
      'invalid-original-data',
    );
  });
  it('does not call a projected receipt getter while counting', async () => {
    let reads = 0;
    const r = seven();
    Object.defineProperty(r, 'status', {
      enumerable: true,
      get() {
        reads++;
        throw new Error('getter executed');
      },
    });
    checkpoint(
      (await api()).countR22AcceptedReceipts([r]),
      'invalid-original-data',
    );
    expect(reads).toBe(0);
  });
});
