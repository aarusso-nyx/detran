// R-0022 CTG-0008 §4 — caracterização da porta de eventos de
// `@detran/shared` (arquivo fixo U, A2.1). Cada caso vale antes e depois da
// migração da outbox (P-API congelada, CTG-0008 §6): nada aqui depende do
// armazenamento (`integration.outbox` ou `outbox.events`).
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

import { outboxIdempotencyKey, type TeatEventEnvelope } from './outbox.js';
import { SqlTeatEventOutbox } from './sql-outbox.js';

// Tokens canônicos citados no próprio contrato da porta (`outbox.ts`:
// `ait.changed` / `AIT_FINALIZADO`); relógio fixo.
function envelope(
  overrides: Partial<TeatEventEnvelope> = {},
): TeatEventEnvelope {
  return {
    id: '',
    type: 'ait.changed',
    domainEvent: 'AIT_FINALIZADO',
    version: 1,
    occurredAt: '2026-09-01T12:00:00.000Z',
    tenantId: '',
    actor: { kind: 'system', id: 'r22-outbox-actor' },
    correlationId: 'r22-outbox-correlation',
    aggregate: { kind: 'ait', id: 'r22-outbox-ait', version: 3 },
    data: {},
    ...overrides,
  };
}

describe('R-0022 CTG-0008 porta de eventos compartilhada', () => {
  it('C-08-17 dado um envelope quando a chave de idempotência é derivada então é <type>:<aggregate.id>:<aggregate.version>', () => {
    expect(outboxIdempotencyKey(envelope())).toBe(
      'ait.changed:r22-outbox-ait:3',
    );
    expect(
      outboxIdempotencyKey(
        envelope({
          type: 'ch.renach.exam-result',
          version: 9,
          tenantId: 'qualquer-tenant',
          aggregate: { kind: 'ch.report', id: 'report-x', version: 2 },
        }),
      ),
    ).toBe('ch.renach.exam-result:report-x:2');
  });

  it('C-08-18 dado uma transação sem query (dublê de guarda) quando append então devolve { id: "" } sem erro nem efeito', async () => {
    const guardOnly = Object.freeze({ kind: 'guard-only-double' });
    await expect(
      new SqlTeatEventOutbox().append(guardOnly as never, envelope()),
    ).resolves.toEqual({ id: '' });
    expect(guardOnly).toEqual({ kind: 'guard-only-double' });
  });
});

const nativeEnvelope = (): TeatEventEnvelope => ({
  id: '',
  type: 'ait.changed',
  domainEvent: 'AIT_FINALIZADO',
  version: 1,
  occurredAt: '2026-09-29T12:00:00Z',
  tenantId: 'TEST_ONLY caller-tenant',
  actor: { kind: 'system', id: 'TEST_ONLY-actor' },
  correlationId: 'TEST_ONLY-correlation',
  aggregate: { kind: 'ait', id: 'TEST_ONLY-aggregate', version: 3 },
  data: { kind: 'TEST_ONLY' },
});
async function nativeApi() {
  const [{ SqlTeatEventOutbox }, { OutboxEventTransactionError }] =
    await Promise.all([import('./sql-outbox.js'), import('@stynx-nyx/outbox')]);
  return { SqlTeatEventOutbox, OutboxEventTransactionError };
}
const nativeRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'TEST_ONLY-native-id',
  tenantId: 'TEST_ONLY-sql-tenant',
  entity: 'ait.changed',
  entityId: 'TEST_ONLY-aggregate',
  idempotencyKey: 'ait.changed:TEST_ONLY-aggregate:3',
  payload: { ...nativeEnvelope(), tenantId: 'TEST_ONLY-sql-tenant' },
  metadata: { aggregateType: 'ait' },
  createdAt: new Date('2026-09-29T12:00:00Z'),
  ...overrides,
});
it('native append source has explicit optional binding and same-transaction delegation', () => {
  const s = readFileSync(new URL('./sql-outbox.ts', import.meta.url), 'utf8');
  expect(s).toMatch(/constructor\s*\([\s\S]*?native\??\s*:/u);
  expect(s).toContain('appendInTransaction');
  expect(s).toMatch(/metadata\s*:\s*\{\s*aggregateType/u);
});
it('native append binds actual SQL tenant, exact event metadata and received transaction without mutating sentinel', async () => {
  const { SqlTeatEventOutbox } = await nativeApi();
  const input = nativeEnvelope(),
    before = structuredClone(input);
  const tx = {
    query: vi.fn(async () => ({
      rows: [{ tenant_id: 'TEST_ONLY-sql-tenant' }],
    })),
  };
  const appendInTransaction = vi.fn(async () => nativeRow());
  await expect(
    new SqlTeatEventOutbox({ appendInTransaction } as never).append(
      tx as never,
      input,
    ),
  ).resolves.toEqual({ id: 'TEST_ONLY-native-id' });
  expect(tx.query).toHaveBeenCalledExactlyOnceWith(
    'select auth.current_tenant() as tenant_id',
  );
  expect(appendInTransaction).toHaveBeenCalledExactlyOnceWith(tx, {
    entity: input.type,
    entityId: input.aggregate.id,
    idempotencyKey: 'ait.changed:TEST_ONLY-aggregate:3',
    payload: { ...input, tenantId: 'TEST_ONLY-sql-tenant' },
    metadata: { aggregateType: 'ait' },
  });
  expect(input).toEqual(before);
  expect(input.id).toBe('');
});
it('native replay returns original native id without any legacy insert or generated receipt', async () => {
  const { SqlTeatEventOutbox } = await nativeApi();
  const tx = {
      query: vi.fn(async () => ({
        rows: [{ tenant_id: 'TEST_ONLY-sql-tenant' }],
      })),
    },
    appendInTransaction = vi.fn(async () => nativeRow()),
    adapter = new SqlTeatEventOutbox({ appendInTransaction } as never);
  await expect(adapter.append(tx as never, nativeEnvelope())).resolves.toEqual({
    id: 'TEST_ONLY-native-id',
  });
  await expect(adapter.append(tx as never, nativeEnvelope())).resolves.toEqual({
    id: 'TEST_ONLY-native-id',
  });
  expect(tx.query).toHaveBeenCalledTimes(2);
  expect(appendInTransaction).toHaveBeenCalledTimes(2);
});
for (const binding of [null, {}, { appendInTransaction: 7 }])
  it(
    'native malformed explicit binding refuses without legacy fallback ' +
      JSON.stringify(binding),
    async () => {
      const { SqlTeatEventOutbox, OutboxEventTransactionError } =
        await nativeApi();
      try {
        const adapter = new SqlTeatEventOutbox(binding as never);
        await adapter.append({} as never, nativeEnvelope());
        throw new Error('TEST_ONLY missing refusal');
      } catch (e) {
        expect(e).toBeInstanceOf(OutboxEventTransactionError);
        expect(e).toMatchObject({ reason: 'transaction_role' });
      }
    },
  );
it('native missing transaction query typed-refuses before service invocation', async () => {
  const { SqlTeatEventOutbox, OutboxEventTransactionError } = await nativeApi();
  const appendInTransaction = vi.fn(async () => nativeRow());
  await expect(
    new SqlTeatEventOutbox({ appendInTransaction } as never).append(
      {} as never,
      nativeEnvelope(),
    ),
  ).rejects.toBeInstanceOf(OutboxEventTransactionError);
  expect(appendInTransaction).not.toHaveBeenCalled();
});
for (const rows of [
  [],
  [{ tenant_id: null }],
  [{ tenant_id: 'TEST_ONLY-a' }, { tenant_id: 'TEST_ONLY-b' }],
])
  it(
    'native incoherent SQL tenant never falls back to caller ' +
      JSON.stringify(rows),
    async () => {
      const { SqlTeatEventOutbox, OutboxEventTransactionError } =
        await nativeApi();
      const tx = { query: vi.fn(async () => ({ rows })) },
        appendInTransaction = vi.fn(async () => nativeRow());
      await expect(
        new SqlTeatEventOutbox({ appendInTransaction } as never).append(
          tx as never,
          nativeEnvelope(),
        ),
      ).rejects.toMatchObject({
        name: OutboxEventTransactionError.name,
        reason: 'tenant',
      });
      expect(appendInTransaction).not.toHaveBeenCalled();
      expect(tx.query).toHaveBeenCalledTimes(1);
    },
  );
it('native actual service refusal propagates by identity with no extra transaction work', async () => {
  const { SqlTeatEventOutbox } = await nativeApi();
  const actual = new Error('TEST_ONLY native refusal'),
    tx = {
      query: vi.fn(async () => ({
        rows: [{ tenant_id: 'TEST_ONLY-sql-tenant' }],
      })),
    },
    appendInTransaction = vi.fn(async () => {
      throw actual;
    });
  await expect(
    new SqlTeatEventOutbox({ appendInTransaction } as never).append(
      tx as never,
      nativeEnvelope(),
    ),
  ).rejects.toBe(actual);
  expect(tx.query).toHaveBeenCalledTimes(1);
});
it('native returned foreign tenant typed-refuses the apparently successful id', async () => {
  const { SqlTeatEventOutbox, OutboxEventTransactionError } = await nativeApi();
  const tx = {
      query: vi.fn(async () => ({
        rows: [{ tenant_id: 'TEST_ONLY-sql-tenant' }],
      })),
    },
    appendInTransaction = vi.fn(async () =>
      nativeRow({ tenantId: 'TEST_ONLY-foreign' }),
    );
  await expect(
    new SqlTeatEventOutbox({ appendInTransaction } as never).append(
      tx as never,
      nativeEnvelope(),
    ),
  ).rejects.toMatchObject({
    name: OutboxEventTransactionError.name,
    reason: 'tenant',
  });
});
it('native absent returned id typed-refuses without inventing one', async () => {
  const { SqlTeatEventOutbox, OutboxEventTransactionError } = await nativeApi();
  const tx = {
      query: vi.fn(async () => ({
        rows: [{ tenant_id: 'TEST_ONLY-sql-tenant' }],
      })),
    },
    appendInTransaction = vi.fn(async () => nativeRow({ id: undefined }));
  await expect(
    new SqlTeatEventOutbox({ appendInTransaction } as never).append(
      tx as never,
      nativeEnvelope(),
    ),
  ).rejects.toBeInstanceOf(OutboxEventTransactionError);
});
