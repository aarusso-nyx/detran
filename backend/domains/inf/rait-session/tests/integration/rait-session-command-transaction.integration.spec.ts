import { describe, expect, it } from 'vitest';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const ACTOR = '00000000-0000-4000-8000-0000b0000005';

type Effects = { writes: string[]; events: string[]; audits: string[] };
type Runtime = { execute(input: Record<string, unknown>): Promise<unknown> };

async function subject(): Promise<{ runtime: Runtime; effects: Effects }> {
  const effects: Effects = { writes: [], events: [], audits: [] };
  const module = (await import(
    new URL(
      '../../src/handwritten/rait-session-command.service.js',
      import.meta.url,
    ).href
  )) as {
    createSessionCommandRuntime: (input: Record<string, unknown>) => Runtime;
  };
  return {
    runtime: module.createSessionCommandRuntime({
      clock: { now: () => new Date('2026-09-14T12:00:00.000Z') },
      effects,
      fixture: { minutesState: 'ATA_ASSINADA', allItemsComplete: true },
      transaction: async <T>(work: () => Promise<T>) => {
        const before = structuredClone(effects);
        try {
          return await work();
        } catch (error) {
          effects.writes.splice(0, effects.writes.length, ...before.writes);
          effects.events.splice(0, effects.events.length, ...before.events);
          effects.audits.splice(0, effects.audits.length, ...before.audits);
          throw error;
        }
      },
    }),
    effects,
  };
}

describe('CTG-0002 session transactional behavior', () => {
  it('dado publicação recusada por ata já publicada quando executada então não confirma escrita, evento ou auditoria', async () => {
    const { runtime, effects } = await subject();
    await expect(
      runtime.execute({
        command: 'publish',
        tenantId: TENANT,
        actorId: ACTOR,
        roles: ['rait-secretary'],
        headers: { 'If-Match': '"1"', 'Idempotency-Key': 'published-once' },
        payload: { alreadyPublished: true },
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'RAIT.MINUTES_ALREADY_PUBLISHED',
    });
    expect(effects).toEqual({ writes: [], events: [], audits: [] });
  });
});
