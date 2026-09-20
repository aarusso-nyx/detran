import { describe, expect, it } from 'vitest';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const ACTOR = '00000000-0000-4000-8000-0000b0000005';

type Effects = { writes: string[]; events: string[]; audits: string[] };
type Runtime = { execute(input: Record<string, unknown>): Promise<unknown> };

async function subject(failAt?: 'outbox'): Promise<{
  runtime: Runtime;
  effects: Effects;
  transactions: () => number;
}> {
  const effects: Effects = { writes: [], events: [], audits: [] };
  let transactionCount = 0;
  const module = (await import(
    new URL(
      '../../src/handwritten/rait-worklist-command.service.js',
      import.meta.url,
    ).href
  )) as {
    createWorklistCommandRuntime: (input: Record<string, unknown>) => Runtime;
  };
  const runtime = module.createWorklistCommandRuntime({
    clock: { now: () => new Date('2026-09-14T12:00:00.000Z') },
    effects,
    fixture: { batchState: 'LOTE_ABERTO', eligibleMembers: ['member-1'] },
    transaction: async <T>(work: () => Promise<T>) => {
      transactionCount += 1;
      const before = structuredClone(effects);
      try {
        if (failAt === 'outbox') throw new Error('injected outbox failure');
        return await work();
      } catch (error) {
        effects.writes.splice(0, effects.writes.length, ...before.writes);
        effects.events.splice(0, effects.events.length, ...before.events);
        effects.audits.splice(0, effects.audits.length, ...before.audits);
        throw error;
      }
    },
  });
  return { runtime, effects, transactions: () => transactionCount };
}

describe('CTG-0002 worklist transactional behavior', () => {
  it('dado falha injetada na fronteira transacional quando draw é solicitado então não confirma lote, assignment, outbox ou auditoria', async () => {
    const { runtime, effects, transactions } = await subject('outbox');

    await expect(
      runtime.execute({
        command: 'draw',
        tenantId: TENANT,
        actorId: ACTOR,
        roles: ['rait-secretary'],
        headers: { 'If-Match': '"1"', 'Idempotency-Key': 'draw-rollback' },
        payload: {},
      }),
    ).rejects.toThrow('injected outbox failure');
    expect(transactions()).toBe(1);
    expect(effects).toEqual({ writes: [], events: [], audits: [] });
  });
});
