import { describe, expect, it } from 'vitest';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const OTHER_TENANT = '00000000-0000-7000-8000-00000000a002';
const ACTOR = '00000000-0000-4000-8000-0000b0000005';
const SCHEDULE = '00000000-0000-7000-8000-000027000001';
const BATCH = '00000000-0000-7000-8000-000028000001';
const CASE = '00000000-0000-7000-8000-000010000018';

type Effects = { writes: string[]; events: string[]; audits: string[] };
type Result = {
  data: Record<string, unknown>;
  events: Array<{ type: string }>;
  etag: string;
};
type Runtime = { execute(input: Record<string, unknown>): Promise<Result> };

type Command = {
  readonly name: string;
  readonly targetId: string;
  readonly role: string;
  readonly fixture: Record<string, unknown>;
  readonly payload: Record<string, unknown>;
  readonly stateError: string;
  readonly events: readonly string[];
  readonly requiresIfMatch: boolean;
};

const COMMANDS: readonly Command[] = [
  {
    name: 'create-schedule',
    targetId: SCHEDULE,
    role: 'rait-coordinator',
    fixture: { memberBound: true, period: '2026-09-21/2026-09-27' },
    payload: {
      poolId: '00000000-0000-7000-8000-000020000002',
      memberId: '00000000-0000-7000-8000-000021000004',
      kind: 'escala_semanal',
      periodStart: '2026-09-21',
      periodEnd: '2026-09-27',
    },
    stateError: 'RAIT.SCHEDULE_PERIOD_LOCKED',
    events: [],
    requiresIfMatch: false,
  },
  {
    name: 'publish-schedule',
    targetId: SCHEDULE,
    role: 'rait-coordinator',
    fixture: { scheduleState: 'RASCUNHO', dutyMember: true, memberBound: true },
    payload: {},
    stateError: 'RAIT.SCHEDULE_PERIOD_LOCKED',
    events: ['rait.schedule.published'],
    requiresIfMatch: true,
  },
  {
    name: 'create-batch',
    targetId: BATCH,
    role: 'rait-secretary',
    fixture: { memberBound: true, orderedCaseIds: [CASE] },
    payload: {
      poolId: '00000000-0000-7000-8000-000020000002',
      weekStart: '2026-09-14',
      caseIds: [CASE],
    },
    stateError: 'RAIT.BATCH_STATE_INVALID',
    events: ['rait.batch.changed'],
    requiresIfMatch: false,
  },
  {
    name: 'approve-batch',
    targetId: BATCH,
    role: 'rait-chair',
    fixture: {
      batchState: 'LOTE_SORTEADO',
      reproducible: true,
      memberBound: true,
    },
    payload: { signedMinutesRef: 'fixture-pades-tsa' },
    stateError: 'RAIT.BATCH_STATE_INVALID',
    events: [],
    requiresIfMatch: true,
  },
  {
    name: 'accept-batch-item',
    targetId: BATCH,
    role: 'rait-rapporteur',
    fixture: {
      batchState: 'LOTE_SORTEADO',
      claimDueOn: '2026-09-16',
      clock: '2026-09-14',
      memberBound: true,
    },
    payload: { caseId: CASE },
    stateError: 'RAIT.BATCH_STATE_INVALID',
    events: ['rait.batch.changed'],
    requiresIfMatch: true,
  },
  {
    name: 'declare-batch-item-impediment',
    targetId: BATCH,
    role: 'rait-rapporteur',
    fixture: {
      batchState: 'LOTE_SORTEADO',
      claimDueOn: '2026-09-16',
      clock: '2026-09-14',
      memberBound: true,
      nextEligibleMember: '00000000-0000-7000-8000-000021000010',
    },
    payload: {
      caseId: CASE,
      kind: 'impedimento',
      grounds: 'fundamento tipado',
    },
    stateError: 'RAIT.BATCH_STATE_INVALID',
    events: ['rait.impediment.declared'],
    requiresIfMatch: true,
  },
];

async function subject(fixture: Record<string, unknown>): Promise<{
  runtime: Runtime;
  effects: Effects;
}> {
  const effects: Effects = { writes: [], events: [], audits: [] };
  const module = (await import(
    new URL(
      '../../src/handwritten/rait-worklist-command.service.js',
      import.meta.url,
    ).href
  )) as {
    createWorklistCommandRuntime(input: {
      clock: { now(): Date };
      effects: Effects;
      fixture: Record<string, unknown>;
      transaction<T>(work: () => Promise<T>): Promise<T>;
    }): Runtime;
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

function request(
  command: Command,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    command: command.name,
    targetId: command.targetId,
    tenantId: TENANT,
    actorId: ACTOR,
    roles: [command.role],
    payload: command.payload,
    headers: {
      'Idempotency-Key': `ctg2-${command.name}`,
      ...(command.requiresIfMatch ? { 'If-Match': '"1"' } : {}),
    },
    ...overrides,
  };
}

function expectNoSuccessEffects(effects: Effects) {
  expect(effects.writes).toEqual([]);
  expect(effects.events).toEqual([]);
  expect(effects.audits).toEqual([]);
}

describe('CTG-0002 worklist corrective command sensors', () => {
  for (const command of COMMANDS) {
    it(`dado fixture canônica quando ${command.name} é executado então confirma ${command.events.length ? command.events.join(', ') : 'events[] vazio'} com ETag`, async () => {
      const { runtime, effects } = await subject(command.fixture);

      const result = await runtime.execute(request(command));
      expect(result).toMatchObject({
        data: expect.any(Object),
        events: expect.any(Array),
        etag: expect.any(String),
      });
      expect(effects.writes).toHaveLength(1);
      expect(result.events).toEqual(command.events.map((type) => ({ type })));
      expect(effects.events).toEqual(command.events);
      expect(effects.audits).toHaveLength(1);
    });

    it(`dado papel sem autorização quando ${command.name} é executado então RAIT.FORBIDDEN_ACTION não confirma efeito`, async () => {
      const { runtime, effects } = await subject(command.fixture);

      await expect(
        runtime.execute(request(command, { roles: ['technical-admin'] })),
      ).rejects.toMatchObject({ status: 403, code: 'RAIT.FORBIDDEN_ACTION' });
      expectNoSuccessEffects(effects);
    });

    it(`dado papel canônico sem vínculo ativo quando ${command.name} é executado então RAIT.FORBIDDEN_ACTION não confirma efeito`, async () => {
      const { runtime, effects } = await subject({
        ...command.fixture,
        memberBound: false,
      });

      await expect(runtime.execute(request(command))).rejects.toMatchObject({
        status: 403,
        code: 'RAIT.FORBIDDEN_ACTION',
      });
      expectNoSuccessEffects(effects);
    });

    it(`dado tenant divergente quando ${command.name} é executado então RAIT.TENANT_MISMATCH não confirma efeito`, async () => {
      const { runtime, effects } = await subject(command.fixture);

      await expect(
        runtime.execute(request(command, { tenantId: OTHER_TENANT })),
      ).rejects.toMatchObject({ status: 404, code: 'RAIT.TENANT_MISMATCH' });
      expectNoSuccessEffects(effects);
    });

    it(`dado estado não permitido quando ${command.name} é executado então ${command.stateError} não confirma efeito`, async () => {
      const { runtime, effects } = await subject({
        ...command.fixture,
        batchState: 'LOTE_ACEITO',
        scheduleState: 'PUBLICADA',
      });

      await expect(runtime.execute(request(command))).rejects.toMatchObject({
        status: 409,
        code: command.stateError,
      });
      expectNoSuccessEffects(effects);
    });

    it(`dado replay idêntico quando ${command.name} é executado então conserva uma escrita, ${command.events.length} eventos e uma auditoria`, async () => {
      const { runtime, effects } = await subject(command.fixture);
      const input = request(command);

      const first = await runtime.execute(input);
      await expect(runtime.execute(input)).resolves.toEqual(first);
      expect(effects.writes).toHaveLength(1);
      expect(effects.events).toHaveLength(command.events.length);
      expect(effects.audits).toHaveLength(1);
    });

    it(`dado replay com payload divergente quando ${command.name} é executado então RAIT.IDEMPOTENCY_REPLAY não confirma efeito adicional`, async () => {
      const { runtime, effects } = await subject(command.fixture);
      const input = request(command);

      await runtime.execute(input);
      await expect(
        runtime.execute(
          request(command, {
            payload: { ...command.payload, replayProbe: 'different' },
          }),
        ),
      ).rejects.toMatchObject({ status: 409, code: 'RAIT.IDEMPOTENCY_REPLAY' });
      expect(effects.writes).toHaveLength(1);
      expect(effects.events).toHaveLength(command.events.length);
      expect(effects.audits).toHaveLength(1);
    });

    if (command.requiresIfMatch) {
      it(`dado ${command.name} sem If-Match quando é executado então RAIT.IF_MATCH_REQUIRED não confirma efeito`, async () => {
        const { runtime, effects } = await subject(command.fixture);

        await expect(
          runtime.execute(
            request(command, { headers: { 'Idempotency-Key': 'missing' } }),
          ),
        ).rejects.toMatchObject({
          status: 428,
          code: 'RAIT.IF_MATCH_REQUIRED',
        });
        expectNoSuccessEffects(effects);
      });
    }
  }

  it('dada escala sem plantonista no dia útil quando publish-schedule é executado então RAIT.SCHEDULE_NO_DUTY_MEMBER não confirma efeito', async () => {
    const publish = COMMANDS[1]!;
    const { runtime, effects } = await subject({
      ...publish.fixture,
      dutyMember: false,
    });
    await expect(runtime.execute(request(publish))).rejects.toMatchObject({
      status: 422,
      code: 'RAIT.SCHEDULE_NO_DUTY_MEMBER',
    });
    expectNoSuccessEffects(effects);
  });

  it('dado plantão vigente e WIP 44 quando claim-next é reexecutado então mantém a regressão de atribuição única e rait.assignment.changed', async () => {
    const { runtime, effects } = await subject({
      activeAssignments: 44,
      availability: 'EM_PLANTAO',
      caseState: 'DISTRIBUIDO',
    });
    const result = await runtime.execute({
      command: 'claim-next',
      targetId: '00000000-0000-7000-8000-000020000001',
      tenantId: TENANT,
      actorId: '00000000-0000-4000-8000-0000b0000001',
      roles: ['rait-analyst'],
      payload: {},
      headers: { 'Idempotency-Key': 'ctg2-claim-wip-44' },
    });
    expect(result.events).toEqual([{ type: 'rait.assignment.changed' }]);
    expect(effects).toEqual({
      writes: ['EM_INSTRUCAO'],
      events: ['rait.assignment.changed'],
      audits: ['rait.assignment.changed'],
    });
  });

  it('dado WIP 45 quando claim-next é reexecutado então RAIT.ASSIGNMENT_WIP_LIMIT não confirma efeito', async () => {
    const { runtime, effects } = await subject({
      activeAssignments: 45,
      availability: 'EM_PLANTAO',
      caseState: 'DISTRIBUIDO',
    });
    await expect(
      runtime.execute({
        command: 'claim-next',
        targetId: '00000000-0000-7000-8000-000020000001',
        tenantId: TENANT,
        actorId: '00000000-0000-4000-8000-0000b0000001',
        roles: ['rait-analyst'],
        payload: {},
        headers: { 'Idempotency-Key': 'ctg2-claim-wip-45' },
      }),
    ).rejects.toMatchObject({ status: 422, code: 'RAIT.ASSIGNMENT_WIP_LIMIT' });
    expectNoSuccessEffects(effects);
  });

  it('dado lote aberto e membros ordenados quando draw é reexecutado então persiste seed, ordem, T-CLAIM e resultado reproduzível', async () => {
    const { runtime, effects } = await subject({
      batchState: 'LOTE_ABERTO',
      eligibleMembers: [
        '00000000-0000-7000-8000-000021000008',
        '00000000-0000-7000-8000-000021000010',
      ],
      orderedCaseIds: [CASE],
      claimBusinessDays: 2,
    });
    await expect(
      runtime.execute({
        command: 'draw',
        targetId: BATCH,
        tenantId: TENANT,
        actorId: ACTOR,
        roles: ['rait-secretary'],
        payload: {},
        headers: { 'Idempotency-Key': 'ctg2-draw-reproducible' },
      }),
    ).resolves.toMatchObject({
      data: {
        seed: expect.any(String),
        ordered_case_ids: [CASE],
        claim_due_on: '2026-09-16',
      },
      events: [
        { type: 'rait.batch.changed' },
        { type: 'rait.assignment.changed' },
      ],
    });
    expect(effects.audits).toHaveLength(1);
  });

  it('dado atribuição ativa quando reassign é reexecutado então exige troca atômica e rait.assignment.changed sem dupla atribuição', async () => {
    const { runtime, effects } = await subject({
      assignmentState: 'ATIVA',
      replacementEligible: true,
    });
    await expect(
      runtime.execute({
        command: 'reassign',
        targetId: '00000000-0000-7000-8000-000022000006',
        tenantId: TENANT,
        actorId: '00000000-0000-4000-8000-0000b0000004',
        roles: ['rait-coordinator'],
        payload: {
          replacementMemberId: '00000000-0000-7000-8000-000021000002',
          reason: 'redistribuicao-tipificada',
        },
        headers: {
          'Idempotency-Key': 'ctg2-reassign-regression',
          'If-Match': '"1"',
        },
      }),
    ).resolves.toMatchObject({
      events: [{ type: 'rait.assignment.changed' }],
    });
    expect(effects).toEqual({
      writes: ['ATIVA'],
      events: ['rait.assignment.changed'],
      audits: ['rait.assignment.changed'],
    });
  });
});
