// Inspector: TEST_ONLY actual workspace method bodies, no SDK/DB/HTTP evaluation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const selected = {
  app: {
    path: 'backend/app/src/r22-stynx-outbox.adapter.ts',
    sha256: '18ce8792ab90c43c2fb7fd727212f3e93c64669e89788272f803c9f6fa694be0',
  },
  key: {
    path: 'backend/domains/shared/src/events/outbox.ts',
    sha256: 'c64ac6ea21dcb3116f04950def326244f68ee31f4d33a4cf8d7d7ea051bd5f08',
  },
  reader: {
    path: 'backend/domains/shared/src/events/stynx-event-log-reader.ts',
    sha256: '80a75c19348f17d3e1e18414fdee17a430defddfb88f36072c8ee03e77f84b6d',
  },
};
const text = Object.fromEntries(
  Object.entries(selected).map(([key, record]) => {
    const bytes = readFileSync(path.join(root, record.path));
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      record.sha256,
      'Selected workspace source drift',
    );
    return [key, bytes.toString('utf8')];
  }),
);
function body(source, marker, indent = '  ') {
  const start = source.indexOf(marker);
  assert.ok(
    start >= 0 && source.indexOf(marker, start + marker.length) === -1,
    'Method marker must be unique: ' + marker,
  );
  const opening = source.indexOf(' {\n', start);
  const closing = source.indexOf('\n' + indent + '}\n', opening);
  assert.ok(
    opening > start && closing > opening,
    'Exact method bounds required',
  );
  return source.slice(opening + 2, closing + 1);
}
const originalAppend = body(text.app, '  async append(');
const generic = 'tx.query<{ tenant_id: string | null }>(';
assert.equal(originalAppend.split(generic).length - 1, 1);
const appendBody = originalAppend.replace(generic, 'tx.query(');
assert.equal(appendBody.split('tx.query(').length - 1, 1);
assert.equal(
  appendBody.replace('tx.query(', generic),
  originalAppend,
  'Only type erasure permitted',
);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const append = new AsyncFunction(
  'tx',
  'envelope',
  'outboxIdempotencyKey',
  appendBody,
);
const keyBody = body(text.key, 'export function outboxIdempotencyKey(', '');
const idempotency = new Function('envelope', keyBody);
const scopeBody = body(text.reader, '  private scope(): OutboxStreamScope');
class TEST_ONLY_MissingContext extends Error {}
const scope = new Function('RequestContextMissingError', scopeBody);
const envelope = () => ({
  id: '',
  type: 'ait.changed',
  domainEvent: 'AIT_FINALIZADO',
  version: 1,
  occurredAt: '2026-09-29T12:00:00Z',
  tenantId: 'TEST_ONLY-claimed-other-tenant',
  actor: { kind: 'system', id: 'TEST_ONLY-actor' },
  correlationId: 'TEST_ONLY-correlation',
  aggregate: { kind: 'ait', id: 'TEST_ONLY-aggregate', version: 3 },
  data: { text: 'preserve bytes ç ñ', nested: { version: 1 } },
});

test('TEST_ONLY extraction keeps exact three sources and inverse type-only erasure', () => {
  assert.equal(appendBody.replace('tx.query(', generic), originalAppend);
  assert.equal(Object.keys(selected).length, 3);
  assert.equal(idempotency(envelope()), 'ait.changed:TEST_ONLY-aggregate:3');
});
for (const [label, rows] of [
  ['no rows', []],
  ['missing tenant', [{}]],
  ['null tenant', [{ tenant_id: null }]],
  ['empty tenant', [{ tenant_id: '' }]],
]) {
  test(
    'TEST_ONLY app append refuses ' + label + ' before native port',
    async () => {
      let calls = 0;
      const native = {
        appendInTransaction() {
          calls++;
          throw new Error('unexpected port call');
        },
      };
      const tx = { query: async () => ({ rows }) };
      await assert.rejects(
        append.call({ outbox: native }, tx, envelope(), idempotency),
        /DETRAN event append requires a SQL tenant context/,
      );
      assert.equal(calls, 0);
    },
  );
}
test('TEST_ONLY app append preserves SQL error identity before native port', async () => {
  const actual = new Error('TEST_ONLY SQL refusal');
  let calls = 0;
  const tx = {
    query: async () => {
      throw actual;
    },
  };
  await assert.rejects(
    append.call(
      {
        outbox: {
          appendInTransaction() {
            calls++;
          },
        },
      },
      tx,
      envelope(),
      idempotency,
    ),
    (error) => error === actual,
  );
  assert.equal(calls, 0);
});
test('TEST_ONLY app append retains transaction and SQL tenant metadata without input mutation', async () => {
  const input = envelope(),
    before = structuredClone(input);
  let queries = 0,
    calls = 0;
  const tx = {
    query: async (sql) => {
      queries++;
      assert.equal(sql, 'select auth.current_tenant()::text as tenant_id');
      return { rows: [{ tenant_id: 'TEST_ONLY-SQL-tenant' }] };
    },
  };
  const native = {
    appendInTransaction: async (received, event) => {
      calls++;
      assert.equal(received, tx);
      assert.deepEqual(event, {
        entity: input.type,
        entityId: input.aggregate.id,
        idempotencyKey: idempotency(input),
        payload: { ...input, tenantId: 'TEST_ONLY-SQL-tenant' },
        metadata: { aggregateType: input.aggregate.kind },
      });
      return { id: 'TEST_ONLY-returned-id' };
    },
  };
  assert.deepEqual(
    await append.call({ outbox: native }, tx, input, idempotency),
    { id: 'TEST_ONLY-returned-id' },
  );
  assert.equal(queries, 1);
  assert.equal(calls, 1);
  assert.deepEqual(input, before);
  assert.equal(input.id, '');
});
test('TEST_ONLY app append preserves native refusal identity without fallback', async () => {
  const actual = new Error('TEST_ONLY native refusal');
  let calls = 0;
  const tx = {
    query: async () => ({ rows: [{ tenant_id: 'TEST_ONLY-SQL-tenant' }] }),
  };
  await assert.rejects(
    append.call(
      {
        outbox: {
          appendInTransaction: async () => {
            calls++;
            throw actual;
          },
        },
      },
      tx,
      envelope(),
      idempotency,
    ),
    (error) => error === actual,
  );
  assert.equal(calls, 1);
});
test('TEST_ONLY app replay delegates twice and returns original native ID without mutating envelope', async () => {
  const input = envelope(),
    before = structuredClone(input);
  let calls = 0;
  const tx = {
    query: async () => ({ rows: [{ tenant_id: 'TEST_ONLY-SQL-tenant' }] }),
  };
  const receiver = {
    outbox: {
      appendInTransaction: async () => {
        calls++;
        return { id: 'TEST_ONLY-existing-id' };
      },
    },
  };
  for (let n = 0; n < 2; n++)
    assert.deepEqual(await append.call(receiver, tx, input, idempotency), {
      id: 'TEST_ONLY-existing-id',
    });
  assert.equal(calls, 2);
  assert.deepEqual(input, before);
});
const dispatch = new Function(
  'limit',
  'filter',
  body(text.app, '  dispatchTenantEventsDue('),
);
for (const [label, input, expected] of [
  ['omitted', undefined, 25],
  ['NaN', NaN, 25],
  ['infinite', Infinity, 25],
  ['negative infinite', -Infinity, 25],
  ['negative', -1, 1],
  ['zero', 0, 1],
  ['fraction', 1.9, 1],
  ['over maximum', 26, 25],
]) {
  test(
    'TEST_ONLY dispatch bounds ' + label + ' and forwards exact filter',
    () => {
      const filter = Object.freeze({
        entities: Object.freeze(['TEST_ONLY-entity']),
      });
      let calls = 0;
      const result = Object.freeze({ kind: 'TEST_ONLY-return' });
      const receiver = {
        outbox: {
          dispatchTenantEventsDue(limit, received) {
            calls++;
            assert.equal(limit, expected);
            assert.equal(received, filter);
            return result;
          },
        },
      };
      assert.equal(dispatch.call(receiver, input, filter), result);
      assert.equal(calls, 1);
    },
  );
}
const rawBody = Buffer.from('{ "eventId": "TEST_ONLY-id" }\r\n');
const ackInput = {
  tenantId: 'TEST_ONLY-illegal-injected-tenant',
  eventId: 'TEST_ONLY-id',
  rawBody,
  status: 'ACKED',
  hmacVerified: false,
};
const delegated = [
  ['ackTenantEvent', ['input'], [ackInput]],
  ['listEvents', ['query'], [Object.freeze({ status: 'ERROR', limit: 7 })]],
  ['getEventDelivery', ['eventId'], ['TEST_ONLY-id']],
  [
    'listEventAttempts',
    ['eventId', 'options'],
    ['TEST_ONLY-id', Object.freeze({ includeBytes: true })],
  ],
  [
    'getQueueHealth',
    ['query'],
    [Object.freeze({ entity: 'TEST_ONLY-entity' })],
  ],
  [
    'retryEvent',
    ['eventId', 'options'],
    ['TEST_ONLY-id', Object.freeze({ immediate: true })],
  ],
  [
    'retireEvent',
    ['eventId', 'input'],
    [
      'TEST_ONLY-id',
      Object.freeze({
        idempotencyKey: 'TEST_ONLY-key',
        reason: 'TEST_ONLY-reason',
      }),
    ],
  ],
  ['getEventRetirement', ['eventId'], ['TEST_ONLY-id']],
];
for (const [method, names, args] of delegated) {
  const invoke = new Function(...names, body(text.app, '  ' + method + '('));
  test(
    'TEST_ONLY control ' +
      method +
      ' preserves arguments and native refusal identity',
    async () => {
      const before = structuredClone(args),
        sentinel = new Error('TEST_ONLY native refusal, not SDK enforcement');
      let calls = 0;
      const receiver = {
        outbox: {
          [method](...received) {
            calls++;
            assert.equal(received.length, args.length);
            for (let n = 0; n < args.length; n++)
              assert.equal(received[n], args[n]);
            return Promise.reject(sentinel);
          },
        },
      };
      await assert.rejects(
        invoke.call(receiver, ...args),
        (error) => error === sentinel,
      );
      assert.equal(calls, 1);
      assert.deepEqual(structuredClone(args), before);
      if (method === 'ackTenantEvent') {
        assert.equal(args[0].rawBody, rawBody);
        assert.equal(args[0].tenantId, 'TEST_ONLY-illegal-injected-tenant');
      }
    },
  );
}
for (const [label, snapshot] of [
  ['whitespace tenant', { tenantId: ' \t', actorId: 'TEST_ONLY-actor' }],
  ['whitespace actor', { tenantId: 'TEST_ONLY-tenant', actorId: ' \t' }],
  ['number tenant', { tenantId: 4, actorId: 'TEST_ONLY-actor' }],
  ['number actor', { tenantId: 'TEST_ONLY-tenant', actorId: 4 }],
  ['null tenant', { tenantId: null, actorId: 'TEST_ONLY-actor' }],
  ['null actor', { tenantId: 'TEST_ONLY-tenant', actorId: null }],
]) {
  test(
    'TEST_ONLY actual reader scope refuses ' +
      label +
      ' using explicitly injected error dependency',
    () => {
      const receiver = {
        context: { hasActiveContext: () => true, snapshot: () => snapshot },
      };
      assert.throws(
        () => scope.call(receiver, TEST_ONLY_MissingContext),
        (error) => error instanceof TEST_ONLY_MissingContext,
      );
      // No published error identity or source/DB call is claimed by this private body test.
    },
  );
}
test('TEST_ONLY reader null snapshot preserves actual TypeError instead of claiming typed SDK refusal', () => {
  const receiver = {
    context: { hasActiveContext: () => true, snapshot: () => null },
  };
  assert.throws(
    () => scope.call(receiver, TEST_ONLY_MissingContext),
    TypeError,
  );
});
