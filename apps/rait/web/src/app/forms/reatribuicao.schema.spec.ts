// R-0012 TASK-0011 (Inspector). `forms/reatribuicao.schema.ts` (contrato CTG-0002c §4.13) —
// ainda não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-63…65 (§8). Ids canônicos de `rait-fixtures.json` (`kb.ts`); os
// 16 estados vêm de `RAIT_CASE_STATES`.
import { readFileSync } from 'node:fs';
import type { z } from 'zod';
import {
  REASSIGN_REASONS,
  REATRIBUICAO_GATE,
  ReatribuicaoSchema,
} from './reatribuicao.schema';
import { RAIT_CASE_STATES } from '../data/models/tokens';
import { FIXTURES_PATH } from '../../testing/kb';
import { GATES_FIXTURE } from '../../testing/gates.fixture';
import { POOL_IDS } from '../../testing/http-fixtures';

interface PoolMemberFixture {
  readonly id: string;
  readonly pool: string;
}
const poolMembers = (
  JSON.parse(readFileSync(FIXTURES_PATH, 'utf8')) as {
    poolMembers: readonly PoolMemberFixture[];
  }
).poolMembers.filter((member) => member.pool === POOL_IDS.jari);
const [MEMBER_1, MEMBER_2] = poolMembers.map((member) => member.id);

const ALLOWED_STATES = ['DISTRIBUIDO', 'EM_INSTRUCAO', 'DILIGENCIA'];

/** Corpo canônico do §8 C-2C-63. */
const VALID_BODY = {
  memberId: MEMBER_2,
  releaseReason: 'afastamento',
  context: {
    currentMemberId: MEMBER_1,
    impededMemberIds: [],
    unavailableMemberIds: [],
    caseState: 'EM_INSTRUCAO',
  },
};

function issues(result: z.ZodSafeParseResult<unknown>): {
  path: PropertyKey[];
  message: string;
}[] {
  expect(result.success).toBe(false);
  if (result.success) throw new Error('unreachable');
  return result.error.issues.map((issue) => ({
    path: [...issue.path],
    message: issue.message,
  }));
}

describe('ReatribuicaoSchema', () => {
  it('dado o corpo canônico (novo responsável distinto, motivo afastamento) quando safeParse então success; releaseReason "concluido" então falha (enum) [negativo]; REASSIGN_REASONS deep-equal aos 4 tokens do §4.13', () => {
    // C-2C-63
    expect(ReatribuicaoSchema.safeParse(VALID_BODY).success).toBe(true);

    const released = ReatribuicaoSchema.safeParse({
      ...VALID_BODY,
      releaseReason: 'concluido',
    });
    expect(issues(released)[0].path).toEqual(['releaseReason']);

    expect([...REASSIGN_REASONS]).toEqual([
      'impedimento',
      'afastamento',
      'rebalanceamento',
      'risco_prescricao',
    ]);
  });

  it('dado R1 memberId igual ao atual então [memberId] memberId.same; R2 impededMemberIds com o novo então memberId.impeded; R3 unavailableMemberIds com o novo então memberId.unavailable', () => {
    // C-2C-64
    const same = ReatribuicaoSchema.safeParse({
      ...VALID_BODY,
      memberId: MEMBER_1,
    });
    expect(issues(same)).toContainEqual({
      path: ['memberId'],
      message: 'rait.forms.reatribuicao.memberId.same',
    });

    const impeded = ReatribuicaoSchema.safeParse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, impededMemberIds: [MEMBER_2] },
    });
    expect(issues(impeded)).toContainEqual({
      path: ['memberId'],
      message: 'rait.forms.reatribuicao.memberId.impeded',
    });

    const unavailable = ReatribuicaoSchema.safeParse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, unavailableMemberIds: [MEMBER_2] },
    });
    expect(issues(unavailable)).toContainEqual({
      path: ['memberId'],
      message: 'rait.forms.reatribuicao.memberId.unavailable',
    });
  });

  it.each(RAIT_CASE_STATES)(
    'dado R4 context.caseState %s então success se DISTRIBUIDO/EM_INSTRUCAO/DILIGENCIA, senão rait.forms.common.state_invalid',
    (state) => {
      // C-2C-65 (parte 1)
      const result = ReatribuicaoSchema.safeParse({
        ...VALID_BODY,
        context: { ...VALID_BODY.context, caseState: state },
      });
      if (ALLOWED_STATES.includes(state)) {
        expect(result.success).toBe(true);
      } else {
        expect(issues(result)).toContainEqual({
          path: ['memberId'],
          message: 'rait.forms.common.state_invalid',
        });
      }
    },
  );

  it('dado REATRIBUICAO_GATE então toEqual à fixture', () => {
    // C-2C-65 (parte 2)
    expect(REATRIBUICAO_GATE).toEqual(GATES_FIXTURE['REATRIBUICAO_GATE']);
  });
});
