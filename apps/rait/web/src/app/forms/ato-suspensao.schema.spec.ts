// R-0012 TASK-0011 (Inspector). `forms/ato-suspensao.schema.ts` (contrato CTG-0002c §4.14) —
// ainda não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-66…68 (§8). Ids canônicos de `http-fixtures.ts`; os códigos de
// timer vêm de `RAIT_TIMER_CODES` (contratos gerados), nunca de lista paralela.
import type { z } from 'zod';
import {
  ATO_SUSPENSAO_GATE,
  ATO_SUSPENSAO_MASKS,
  AtoSuspensaoSchema,
  EXTINCTION_TIMER_CODES,
} from './ato-suspensao.schema';
import { RAIT_TIMER_CODES } from '../data/models/tokens';
import { GATES_FIXTURE } from '../../testing/gates.fixture';
import { CASE_IDS } from '../../testing/http-fixtures';
import { FIXED_ENTITY_ID } from '../../testing/router-harness';

/** Período do ato de suspensão 1 das fixtures (`raitSuspensionActs[0]`, `vigente`). */
const STARTS_ON = '2026-09-10';
const ENDS_ON = '2026-09-20';

/** Corpo canônico do §8 C-2C-66 (`evidenceDocumentId` sem array próprio nas fixtures — id
 * sintético fixo do harness, convenção já usada em `case.client.spec.ts`). */
const VALID_BODY = {
  caseIds: [CASE_IDS['EM_INSTRUCAO']],
  startsOn: STARTS_ON,
  endsOn: ENDS_ON,
  reason: 'Interdição do prédio por enchente.',
  legalBasis: null,
  timerCodes: ['T-DIL'],
  evidenceDocumentId: FIXED_ENTITY_ID,
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

describe('AtoSuspensaoSchema', () => {
  it('dado o corpo canônico (1 caso, período das fixtures, timer T-DIL, prova anexada) quando safeParse então success; caseIds [] então falha; timerCodes [] então falha; sem evidenceDocumentId então falha', () => {
    // C-2C-66
    expect(AtoSuspensaoSchema.safeParse(VALID_BODY).success).toBe(true);

    expect(
      issues(AtoSuspensaoSchema.safeParse({ ...VALID_BODY, caseIds: [] }))[0]
        .path,
    ).toEqual(['caseIds']);
    expect(
      issues(AtoSuspensaoSchema.safeParse({ ...VALID_BODY, timerCodes: [] }))[0]
        .path,
    ).toEqual(['timerCodes']);

    const { evidenceDocumentId: _omit, ...withoutEvidence } = VALID_BODY;
    expect(
      issues(AtoSuspensaoSchema.safeParse(withoutEvidence))[0].path,
    ).toEqual(['evidenceDocumentId']);
  });

  it.each(RAIT_TIMER_CODES)(
    'dado R1 timerCodes [%s] então falha com timerCodes.legal se for relógio de extinção, senão success',
    (code) => {
      // C-2C-67 (parte 1)
      const result = AtoSuspensaoSchema.safeParse({
        ...VALID_BODY,
        timerCodes: [code],
      });
      const extinction = (EXTINCTION_TIMER_CODES as readonly string[]).includes(
        code,
      );
      if (extinction) {
        expect(issues(result)).toContainEqual({
          path: ['timerCodes'],
          message: 'rait.forms.ato-suspensao.timerCodes.legal',
        });
      } else {
        expect(result.success).toBe(true);
      }
    },
  );

  it('dado EXTINCTION_TIMER_CODES então deep-equal aos três relógios de extinção do WF-RAIT-001', () => {
    // C-2C-67 (parte 2)
    expect([...EXTINCTION_TIMER_CODES]).toEqual([
      'T-DEC',
      'T-JUL-24M',
      'T-PAR-3A',
    ]);
  });

  it('dado R2 endsOn anterior a startsOn então [endsOn] rait.forms.common.period_invalid; ATO_SUSPENSAO_GATE toEqual fixture; ATO_SUSPENSAO_MASKS conforme §4.14', () => {
    // C-2C-68
    const inverted = AtoSuspensaoSchema.safeParse({
      ...VALID_BODY,
      startsOn: ENDS_ON,
      endsOn: STARTS_ON,
    });
    expect(issues(inverted)).toContainEqual({
      path: ['endsOn'],
      message: 'rait.forms.common.period_invalid',
    });

    expect(ATO_SUSPENSAO_GATE).toEqual(GATES_FIXTURE['ATO_SUSPENSAO_GATE']);
    expect(ATO_SUSPENSAO_MASKS).toEqual({
      startsOn: 'date',
      endsOn: 'date',
    });
  });
});
