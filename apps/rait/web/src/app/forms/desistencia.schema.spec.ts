// R-0012 TASK-0011 (Inspector). `forms/desistencia.schema.ts` (contrato CTG-0002c §4.10) —
// ainda não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-53…55 (§8). Ids canônicos de `http-fixtures.ts`; os 16 estados
// vêm de `RAIT_CASE_STATES` (contratos gerados), nunca de lista paralela.
import type { z } from 'zod';
import {
  DESISTENCIA_GATE,
  DesistenciaSchema,
  WITHDRAWAL_PRE_DECISION_STATES,
} from './desistencia.schema';
import { RAIT_CASE_STATES } from '../data/models/tokens';
import {
  GATES_FIXTURE,
  WITHDRAWAL_PRE_DECISION_STATES_FIXTURE,
} from '../../testing/gates.fixture';
import { CASE_IDS } from '../../testing/http-fixtures';
import { FIXED_ENTITY_ID } from '../../testing/router-harness';

/** Corpo canônico do §8 C-2C-53 (`termDocumentId`/`signerPartyId` sem array próprio nas
 * fixtures — id sintético fixo do harness, convenção já usada em `case.client.spec.ts`). */
const VALID_BODY = {
  caseId: CASE_IDS['EM_INSTRUCAO'],
  termDocumentId: FIXED_ENTITY_ID,
  signerPartyId: FIXED_ENTITY_ID,
  legitimacyConfirmed: true,
  context: { caseState: 'EM_INSTRUCAO', signerLegitimate: true },
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

describe('DesistenciaSchema', () => {
  it('dado o corpo canônico (termo, signatário legítimo, caso pré-decisão) quando safeParse então success; legitimacyConfirmed false então falha em [legitimacyConfirmed]; sem termDocumentId então falha', () => {
    // C-2C-53
    expect(DesistenciaSchema.safeParse(VALID_BODY).success).toBe(true);

    const notConfirmed = DesistenciaSchema.safeParse({
      ...VALID_BODY,
      legitimacyConfirmed: false,
    });
    expect(issues(notConfirmed)[0].path).toEqual(['legitimacyConfirmed']);

    const { termDocumentId: _omit, ...withoutTerm } = VALID_BODY;
    expect(issues(DesistenciaSchema.safeParse(withoutTerm))[0].path).toEqual([
      'termDocumentId',
    ]);
  });

  it.each(RAIT_CASE_STATES)(
    'dado R1 context.caseState %s então success se pré-decisão, senão falha em [caseId] caseId.after_decision',
    (state) => {
      // C-2C-54 (parte 1)
      const result = DesistenciaSchema.safeParse({
        ...VALID_BODY,
        context: { ...VALID_BODY.context, caseState: state },
      });
      const preDecision = (
        WITHDRAWAL_PRE_DECISION_STATES_FIXTURE as readonly string[]
      ).includes(state);
      if (preDecision) {
        expect(result.success).toBe(true);
      } else {
        expect(issues(result)).toContainEqual({
          path: ['caseId'],
          message: 'rait.forms.desistencia.caseId.after_decision',
        });
      }
    },
  );

  it('dado WITHDRAWAL_PRE_DECISION_STATES então deep-equal à lista do §4.10 (ordem incluída) e com 8 estados', () => {
    // C-2C-54 (parte 2)
    expect([...WITHDRAWAL_PRE_DECISION_STATES]).toEqual([
      ...WITHDRAWAL_PRE_DECISION_STATES_FIXTURE,
    ]);
    expect(WITHDRAWAL_PRE_DECISION_STATES).toHaveLength(8);
  });

  it('dado R2 signerLegitimate false então falha em [signerPartyId] signerPartyId.illegitimate; DESISTENCIA_GATE toEqual fixture (preState = WITHDRAWAL_PRE_DECISION_STATES)', () => {
    // C-2C-55
    const illegitimate = DesistenciaSchema.safeParse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, signerLegitimate: false },
    });
    expect(issues(illegitimate)).toContainEqual({
      path: ['signerPartyId'],
      message: 'rait.forms.desistencia.signerPartyId.illegitimate',
    });

    expect(DESISTENCIA_GATE).toEqual(GATES_FIXTURE['DESISTENCIA_GATE']);
  });
});
