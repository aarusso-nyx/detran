// R-0012 TASK-0011 (Inspector). `forms/pauta.schema.ts` (contrato CTG-0002c §4.8) — ainda não
// existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado, contrato
// §1). Critérios C-2C-43…47 (§8). Ids canônicos de `http-fixtures.ts`; os números de dias
// (`daysUntilSession`, `shortNoticeMinimumDays`) vêm do servidor — o cliente nunca conta dias
// ([RN-RAIT-005]).
import type { z } from 'zod';
import { PAUTA_GATE, PautaSchema } from './pauta.schema';
import { GATES_FIXTURE } from '../../testing/gates.fixture';
import { CASE_IDS, SESSION_IDS } from '../../testing/http-fixtures';

const CASE_A = CASE_IDS['PRONTO_P_DECISAO'];
const CASE_B = CASE_IDS['EM_INSTRUCAO'];

/** Corpo canônico do §8 C-2C-43. */
const VALID_BODY = {
  sessionId: SESSION_IDS['FORMANDO_PAUTA'],
  items: [{ caseId: CASE_A, hasOpinion: true, riskFlag: 'CRITICO' }],
  shortNoticeAck: false,
  context: {
    criticalCaseIds: [CASE_A],
    daysUntilSession: 10,
    shortNoticeMinimumDays: 5,
    sessionState: 'FORMANDO_PAUTA',
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

describe('PautaSchema', () => {
  it('dado o corpo canônico (1 item com parecer, crítico incluído, convocação com folga) quando safeParse então success; items [] então falha em [items]', () => {
    // C-2C-43
    expect(PautaSchema.safeParse(VALID_BODY).success).toBe(true);

    const empty = PautaSchema.safeParse({
      ...VALID_BODY,
      items: [],
      context: { ...VALID_BODY.context, criticalCaseIds: [] },
    });
    expect(issues(empty)).toContainEqual(
      expect.objectContaining({ path: ['items'] }),
    );
  });

  it('dado R1 items[0].hasOpinion false então falha em [items, 0, caseId] items.without_opinion; hasOpinion null então sem essa issue', () => {
    // C-2C-44
    const withoutOpinion = PautaSchema.safeParse({
      ...VALID_BODY,
      items: [{ caseId: CASE_A, hasOpinion: false, riskFlag: 'CRITICO' }],
    });
    expect(issues(withoutOpinion)).toContainEqual({
      path: ['items', 0, 'caseId'],
      message: 'rait.forms.pauta.items.without_opinion',
    });

    const unknownOpinion = PautaSchema.safeParse({
      ...VALID_BODY,
      items: [{ caseId: CASE_A, hasOpinion: null, riskFlag: 'CRITICO' }],
    });
    expect(unknownOpinion.success).toBe(true);
  });

  it('dado R2 criticalCaseIds [A, B] com items só A então falha em [] items.critical_missing; criticalCaseIds [] então success', () => {
    // C-2C-45
    const missing = PautaSchema.safeParse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, criticalCaseIds: [CASE_A, CASE_B] },
    });
    expect(issues(missing)).toContainEqual({
      path: [],
      message: 'rait.forms.pauta.items.critical_missing',
    });

    const none = PautaSchema.safeParse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, criticalCaseIds: [] },
    });
    expect(none.success).toBe(true);
  });

  it('dado R3 daysUntilSession 3 com mínimo 5 e shortNoticeAck false então falha em [shortNoticeAck] required; shortNoticeAck true então success; daysUntilSession null ou mínimo null então success (nunca calculado no cliente)', () => {
    // C-2C-46
    const shortNotice = {
      ...VALID_BODY,
      context: {
        ...VALID_BODY.context,
        daysUntilSession: 3,
        shortNoticeMinimumDays: 5,
      },
    };
    expect(issues(PautaSchema.safeParse(shortNotice))).toContainEqual({
      path: ['shortNoticeAck'],
      message: 'rait.forms.pauta.shortNoticeAck.required',
    });

    expect(
      PautaSchema.safeParse({ ...shortNotice, shortNoticeAck: true }).success,
    ).toBe(true);
    expect(
      PautaSchema.safeParse({
        ...shortNotice,
        context: { ...shortNotice.context, daysUntilSession: null },
      }).success,
    ).toBe(true);
    expect(
      PautaSchema.safeParse({
        ...shortNotice,
        context: { ...shortNotice.context, shortNoticeMinimumDays: null },
      }).success,
    ).toBe(true);
  });

  it('dado R4 items com caseId repetido então items.duplicate; R5 sessionState PAUTA_FECHADA então falha em [sessionId] state_invalid; PAUTA_GATE toEqual fixture', () => {
    // C-2C-47
    const duplicate = PautaSchema.safeParse({
      ...VALID_BODY,
      items: [
        { caseId: CASE_A, hasOpinion: true, riskFlag: 'CRITICO' },
        { caseId: CASE_A, hasOpinion: true, riskFlag: 'CRITICO' },
      ],
    });
    expect(issues(duplicate).map((issue) => issue.message)).toContain(
      'rait.forms.pauta.items.duplicate',
    );

    const closed = PautaSchema.safeParse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, sessionState: 'PAUTA_FECHADA' },
    });
    expect(issues(closed)).toContainEqual({
      path: ['sessionId'],
      message: 'rait.forms.common.state_invalid',
    });

    expect(PAUTA_GATE).toEqual(GATES_FIXTURE['PAUTA_GATE']);
  });
});
