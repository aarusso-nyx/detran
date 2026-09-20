import { describe, expect, it } from 'vitest';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const ACTOR = '00000000-0000-4000-8000-0000b0000001';

type Effects = {
  writes: string[];
  events: string[];
  audits: string[];
  alerts: string[];
};

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
  const effects: Effects = { writes: [], events: [], audits: [], alerts: [] };
  const modulePath = new URL(
    '../../src/handwritten/rait-worklist-command.service.js',
    import.meta.url,
  ).href;
  const module = (await import(modulePath)) as {
    createWorklistCommandRuntime: (input: {
      clock: { now: () => Date };
      effects: Effects;
      fixture: Record<string, unknown>;
      transaction: <T>(work: () => Promise<T>) => Promise<T>;
    }) => Runtime;
  };

  return {
    runtime: module.createWorklistCommandRuntime({
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
    roles: ['rait-analyst'],
    payload,
    headers: {
      'If-Match': '"1"',
      'Idempotency-Key': `worklist-${command}`,
    } as Record<string, string>,
  };
}

describe('CTG-0002 worklist command behavior', () => {
  it('dado membro com WIP 44 quando claim-next é executado então atribui uma vez e emite o evento contratual', async () => {
    const { runtime, effects } = await subject({
      activeAssignments: 44,
      availability: 'DISPONIVEL',
      caseState: 'DISTRIBUIDO',
    });

    await expect(runtime.execute(request('claim-next'))).resolves.toMatchObject(
      {
        data: { state: 'EM_INSTRUCAO' },
        events: [{ type: 'rait.assignment.changed' }],
        etag: expect.any(String),
      },
    );
    expect(effects.writes).toHaveLength(1);
    expect(effects.events).toEqual(['rait.assignment.changed']);
    expect(effects.audits).toHaveLength(1);
  });

  it.each([45, 61])(
    'dado membro com WIP %i quando claim-next é executado então RAIT.ASSIGNMENT_WIP_LIMIT não deixa escrita, evento ou auditoria de sucesso',
    async (activeAssignments) => {
      const { runtime, effects } = await subject({
        activeAssignments,
        availability: 'DISPONIVEL',
        caseState: 'DISTRIBUIDO',
      });

      await expect(
        runtime.execute(request('claim-next')),
      ).rejects.toMatchObject({
        status: 422,
        code: 'RAIT.ASSIGNMENT_WIP_LIMIT',
      });
      expect(effects.writes).toEqual([]);
      expect(effects.events).toEqual([]);
      expect(effects.audits).toEqual([]);
      if (activeAssignments > 60)
        expect(effects.alerts).toEqual(['WIP_ABOVE_60']);
    },
  );

  it('dado tenant ou ator fornecido no payload quando sorteio é solicitado então rejeita antes de toda persistência', async () => {
    const { runtime, effects } = await subject({ batchState: 'LOTE_ABERTO' });

    await expect(
      runtime.execute(
        request('draw', { tenant_id: 'other-tenant', actor_id: 'forged' }),
      ),
    ).rejects.toMatchObject({ status: 400, code: 'RAIT.VALIDATION_FAILED' });
    expect(effects.writes).toEqual([]);
    expect(effects.events).toEqual([]);
    expect(effects.audits).toEqual([]);
  });

  it('dado reatribuição sem If-Match ou com chave repetida quando executada então falha 428 ou reapresenta a única mutação', async () => {
    const { runtime, effects } = await subject({
      assignmentState: 'ATIVA',
      replacementEligible: true,
    });
    const missingIfMatch = request('reassign');
    missingIfMatch.roles = ['rait-coordinator'];
    missingIfMatch.headers = { 'Idempotency-Key': 'same-reassignment' };

    await expect(runtime.execute(missingIfMatch)).rejects.toMatchObject({
      status: 428,
      code: 'RAIT.IF_MATCH_REQUIRED',
    });
    const reassign = request('reassign');
    reassign.roles = ['rait-coordinator'];
    const first = await runtime.execute(reassign);
    await expect(runtime.execute(reassign)).resolves.toEqual(first);
    expect(effects.writes).toHaveLength(1);
    expect(effects.events).toEqual(['rait.assignment.changed']);
    expect(effects.audits).toHaveLength(1);
  });
});
