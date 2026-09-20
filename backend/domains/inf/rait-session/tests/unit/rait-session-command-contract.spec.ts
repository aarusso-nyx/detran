import { describe, expect, it } from 'vitest';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const ACTOR = '00000000-0000-4000-8000-0000b0000011';

type Effects = { writes: string[]; events: string[]; audits: string[] };
type Runtime = {
  execute(input: Record<string, unknown>): Promise<{
    data: Record<string, unknown>;
    events: Array<{ type: string }>;
    etag: string;
  }>;
};

async function subject(
  fixture: Record<string, unknown> = {},
): Promise<{ runtime: Runtime; effects: Effects }> {
  const effects: Effects = { writes: [], events: [], audits: [] };
  const module = (await import(
    new URL(
      '../../src/handwritten/rait-session-command.service.js',
      import.meta.url,
    ).href
  )) as {
    createSessionCommandRuntime: (input: {
      clock: { now: () => Date };
      effects: Effects;
      fixture: Record<string, unknown>;
      transaction: <T>(work: () => Promise<T>) => Promise<T>;
    }) => Runtime;
  };
  return {
    runtime: module.createSessionCommandRuntime({
      clock: { now: () => new Date('2026-09-14T12:00:00.000Z') },
      effects,
      fixture,
      transaction: async (work) => work(),
    }),
    effects,
  };
}

function request(command: string, payload: Record<string, unknown> = {}) {
  return {
    command,
    tenantId: TENANT,
    actorId: ACTOR,
    roles: ['rait-chair'],
    payload,
    headers: { 'If-Match': '"1"', 'Idempotency-Key': `session-${command}` },
  };
}

describe('CTG-0002 session command behavior', () => {
  it.each([
    ['jari', { chairPresent: false, quorumMet: true }],
    ['cetran', { chairPresent: true, quorumMet: true, parityMet: false }],
  ])(
    'dado banca %s sem requisito de quorum quando open é solicitado então RAIT.SESSION_QUORUM_MISSING não deixa efeitos de sucesso',
    async (_body, fixture) => {
      const { runtime, effects } = await subject({
        sessionState: 'CONVOCACAO_ENVIADA',
        ...fixture,
      });

      await expect(runtime.execute(request('open'))).rejects.toMatchObject({
        status: 409,
        code: 'RAIT.SESSION_QUORUM_MISSING',
      });
      expect(effects).toEqual({ writes: [], events: [], audits: [] });
    },
  );

  it('dado membro impedido ou voto já existente quando vote é solicitado então rejeita sem alterar o item de pauta', async () => {
    for (const fixture of [
      { sessionState: 'SESSAO_ABERTA', memberImpeded: true },
      { sessionState: 'SESSAO_ABERTA', existingVote: true },
    ]) {
      const { runtime, effects } = await subject(fixture);
      await expect(runtime.execute(request('vote'))).rejects.toMatchObject({
        status: 409,
      });
      expect(effects).toEqual({ writes: [], events: [], audits: [] });
    }
  });

  it('dado publish com chave opaca repetida quando a ata assinada é publicada então conserva uma só escrita, evento e auditoria', async () => {
    const { runtime, effects } = await subject({
      minutesState: 'ATA_ASSINADA',
      allItemsComplete: true,
    });
    const first = await runtime.execute(request('publish'));
    await expect(runtime.execute(request('publish'))).resolves.toEqual(first);
    expect(first).toMatchObject({
      events: [{ type: 'rait.minutes.published' }],
      etag: expect.any(String),
    });
    expect(effects.writes).toHaveLength(1);
    expect(effects.events).toEqual(['rait.minutes.published']);
    expect(effects.audits).toHaveLength(1);
  });

  it('dado tenant, ator ou sustentação oral no payload quando o comando é solicitado então falha fechado antes de persistir', async () => {
    const { runtime, effects } = await subject({
      sessionState: 'FORMANDO_PAUTA',
    });
    await expect(
      runtime.execute(
        request('close', {
          tenant_id: 'forged',
          actor_id: 'forged',
          oral_argument: true,
        }),
      ),
    ).rejects.toMatchObject({ status: 400, code: 'RAIT.VALIDATION_FAILED' });
    expect(effects).toEqual({ writes: [], events: [], audits: [] });
  });
});
