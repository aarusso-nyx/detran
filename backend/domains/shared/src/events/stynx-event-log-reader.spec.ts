// F3 prospective public reader tests. TEST_ONLY native/context ports; no live SQL proof.
import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import type {
  OutboxEventStreamSource,
  OutboxStreamCursor,
  OutboxStreamRow,
} from '@stynx-nyx/outbox';
import type { RequestContext } from '@stynx-nyx/core';
const T = 'TEST_ONLY-tenant',
  A = 'TEST_ONLY-actor';
const ports = () => ({
  now: vi.fn(async () => new Date('2026-09-29T12:00:00Z')),
  findById: vi.fn(
    async (_id: string, _scope: unknown) => null as OutboxStreamRow | null,
  ),
  listSince: vi.fn(
    async (_cursor: OutboxStreamCursor, _scope: unknown, _limit: number) =>
      [] as readonly OutboxStreamRow[],
  ),
});
const context = (
  snapshot: Record<string, unknown> = { tenantId: T, actorId: A },
) => ({ hasActiveContext: vi.fn(() => true), snapshot: vi.fn(() => snapshot) });
async function make(
  source: ReturnType<typeof ports>,
  c: ReturnType<typeof context>,
) {
  const { StynxEventLogReader } = await import('./stynx-event-log-reader.js');
  return new StynxEventLogReader(
    source as Pick<OutboxEventStreamSource, 'now' | 'findById' | 'listSince'>,
    c as unknown as Pick<RequestContext, 'hasActiveContext' | 'snapshot'>,
  );
}
it('native reader source requires the public active-context seam', () => {
  const s = readFileSync(
    new URL('./stynx-event-log-reader.ts', import.meta.url),
    'utf8',
  );
  for (const token of [
    'StynxEventLogReader',
    'RequestContextMissingError',
    'hasActiveContext',
    'snapshot',
  ])
    expect(s).toContain(token);
});
it('now delegates fresh trusted tenant actor session and preserves actual Date', async () => {
  const source = ports(),
    c = context({ tenantId: T, actorId: A, sessionId: 'TEST_ONLY-session' }),
    reader = await make(source, c);
  const actual = await reader.now();
  expect(source.now).toHaveBeenCalledExactlyOnceWith({
    tenantId: T,
    actorId: A,
    sessionId: 'TEST_ONLY-session',
  });
  expect(actual).toEqual(new Date('2026-09-29T12:00:00Z'));
  expect(source.findById).not.toHaveBeenCalled();
  expect(source.listSince).not.toHaveBeenCalled();
});
it('each read derives current context and omits absent session', async () => {
  const source = ports(),
    c = context();
  c.snapshot
    .mockReturnValueOnce({ tenantId: T, actorId: A })
    .mockReturnValueOnce({
      tenantId: 'TEST_ONLY-next',
      actorId: 'TEST_ONLY-next-actor',
    });
  const reader = await make(source, c);
  await reader.now();
  await reader.findById('TEST_ONLY-event');
  expect(source.now).toHaveBeenCalledExactlyOnceWith({
    tenantId: T,
    actorId: A,
  });
  expect(source.findById).toHaveBeenCalledExactlyOnceWith('TEST_ONLY-event', {
    tenantId: 'TEST_ONLY-next',
    actorId: 'TEST_ONLY-next-actor',
  });
});
for (const [name, snapshot, active] of [
  ['inactive', { tenantId: T, actorId: A }, false],
  ['missing tenant', { actorId: A }, true],
  ['missing actor', { tenantId: T }, true],
] as const)
  it('reader typed-refuses ' + name + ' before any native call', async () => {
    const source = ports(),
      c = context(snapshot);
    c.hasActiveContext.mockReturnValue(active);
    const reader = await make(source, c);
    const { RequestContextMissingError } = await import('@stynx-nyx/core');
    await expect(reader.now()).rejects.toBeInstanceOf(
      RequestContextMissingError,
    );
    await expect(reader.findById('TEST_ONLY-event')).rejects.toBeInstanceOf(
      RequestContextMissingError,
    );
    await expect(
      reader.listSince({ createdAt: new Date(0), id: '' }, 5),
    ).rejects.toBeInstanceOf(RequestContextMissingError);
    expect(source.now).not.toHaveBeenCalled();
    expect(source.findById).not.toHaveBeenCalled();
    expect(source.listSince).not.toHaveBeenCalled();
  });
it('findById preserves null without fabricating a row', async () => {
  const source = ports(),
    reader = await make(source, context());
  await expect(reader.findById('TEST_ONLY-absent')).resolves.toBeNull();
  expect(source.findById).toHaveBeenCalledExactlyOnceWith('TEST_ONLY-absent', {
    tenantId: T,
    actorId: A,
  });
});
it('findById projects actual row id into an independent payload while preserving source', async () => {
  const source = ports(),
    row = {
      id: 'TEST_ONLY-real-row',
      createdAt: new Date(1),
      event: 'ait.changed',
      payload: { id: '', tenantId: T, data: { kind: 'TEST_ONLY' } },
    };
  source.findById.mockResolvedValue(row);
  const before = structuredClone(row),
    reader = await make(source, context());
  const result = await reader.findById(row.id);
  expect(result).toEqual({ ...row, payload: { ...row.payload, id: row.id } });
  expect(result).not.toBe(row);
  expect(result!.payload).not.toBe(row.payload);
  result!.payload.id = 'TEST_ONLY-caller-change';
  expect(row).toEqual(before);
});
it('listSince preserves empty opening id, original Date and limit and projects every row', async () => {
  const source = ports(),
    cursor = { createdAt: new Date('2026-09-29T11:00:00Z'), id: '' },
    rows = [
      {
        id: 'TEST_ONLY-1',
        createdAt: new Date(1),
        event: 'ait.changed',
        payload: { id: '' },
      },
      {
        id: 'TEST_ONLY-2',
        createdAt: new Date(2),
        event: 'ait.changed',
        payload: { id: 'old' },
      },
    ];
  source.listSince.mockResolvedValue(rows);
  const reader = await make(source, context());
  const result = await reader.listSince(cursor, 13);
  expect(source.listSince).toHaveBeenCalledExactlyOnceWith(
    cursor,
    { tenantId: T, actorId: A },
    13,
  );
  expect(cursor.id).toBe('');
  expect(result.map((r) => r.payload.id)).toEqual(rows.map((r) => r.id));
  expect(rows.map((r) => r.payload.id)).toEqual(['', 'old']);
});
it('native error object propagates without fallback or replacement', async () => {
  const source = ports(),
    actual = new Error('TEST_ONLY native refusal');
  source.findById.mockRejectedValue(actual);
  const reader = await make(source, context());
  await expect(reader.findById('TEST_ONLY-id')).rejects.toBe(actual);
  expect(source.now).not.toHaveBeenCalled();
  expect(source.listSince).not.toHaveBeenCalled();
});
