// R-0012 TASK-0011 (Inspector). `forms/triagem.schema.ts` (contrato CTG-0002c §4.2) — ainda não
// existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado, contrato
// §1). Critérios C-2C-17…23 (§8). Nenhuma data calculada; a tempestividade é fato do servidor
// espelhado em `context` ([RN-RAIT-005]).
import type { z } from 'zod';
import {
  TRIAGEM_ADMIT_GATE,
  TRIAGEM_GATE,
  TRIAGEM_REJECT_GATE,
  TriagemSchema,
} from './triagem.schema';
import { GATES_FIXTURE } from '../../testing/gates.fixture';

const ART4_GROUNDS = 'Art. 4º, inciso III, da Res. 900/2022';

const VERDICT_TRUE = { verdict: true, reason: 'Critério atendido.' };

/** Corpo canônico do §8 C-2C-17. */
const VALID_BODY = {
  verdicts: {
    legitimidade: { ...VERDICT_TRUE },
    assinatura: { ...VERDICT_TRUE },
    pedido_compativel: { ...VERDICT_TRUE },
  },
  outcome: 'admit',
  nonAdmissionReason: null,
  nonAdmissionGrounds: '',
  context: {
    timelinessVerdict: true,
    caseState: 'TRIAGEM_ADMISSIBILIDADE',
  },
};

type Body = typeof VALID_BODY;

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

function parse(body: Record<string, unknown>) {
  return TriagemSchema.safeParse(body);
}

function withVerdicts(
  body: Body,
  patch: Partial<Record<keyof Body['verdicts'], unknown>>,
): Record<string, unknown> {
  return { ...body, verdicts: { ...body.verdicts, ...patch } };
}

describe('TriagemSchema', () => {
  it('dado o corpo canônico (3 vereditos true com reason, outcome admit) quando safeParse então success; dado outcome triage com vereditos null e reasons vazias então success (parcial permitido)', () => {
    // C-2C-17
    expect(parse(VALID_BODY).success).toBe(true);

    const partial = {
      ...VALID_BODY,
      outcome: 'triage',
      verdicts: {
        legitimidade: { verdict: null, reason: '' },
        assinatura: { verdict: null, reason: '' },
        pedido_compativel: { verdict: null, reason: '' },
      },
      context: {
        timelinessVerdict: null,
        caseState: 'TRIAGEM_ADMISSIBILIDADE',
      },
    };
    expect(parse(partial).success).toBe(true);
  });

  it('dado R2 outcome reject sem nonAdmissionReason então falha em [nonAdmissionReason] required; grounds sem citação então falha em [nonAdmissionGrounds] cite_art4; grounds com art. 4º e reason sem_assinatura com assinatura.verdict false então success', () => {
    // C-2C-18
    const noReason = parse({
      ...VALID_BODY,
      outcome: 'reject',
      nonAdmissionReason: null,
      nonAdmissionGrounds: ART4_GROUNDS,
    });
    expect(issues(noReason)).toContainEqual({
      path: ['nonAdmissionReason'],
      message: 'rait.forms.triagem.nonAdmissionReason.required',
    });

    const badGrounds = parse({
      ...withVerdicts(VALID_BODY, {
        assinatura: { verdict: false, reason: 'Peça sem assinatura.' },
      }),
      outcome: 'reject',
      nonAdmissionReason: 'sem_assinatura',
      nonAdmissionGrounds: 'sem fundamento',
    });
    expect(issues(badGrounds)).toContainEqual({
      path: ['nonAdmissionGrounds'],
      message: 'rait.forms.triagem.nonAdmissionGrounds.cite_art4',
    });

    const valid = parse({
      ...withVerdicts(VALID_BODY, {
        assinatura: { verdict: false, reason: 'Peça sem assinatura.' },
      }),
      outcome: 'reject',
      nonAdmissionReason: 'sem_assinatura',
      nonAdmissionGrounds: ART4_GROUNDS,
    });
    expect(valid.success).toBe(true);
  });

  it('dado R3 outcome admit com legitimidade.verdict null então falha em [verdicts, legitimidade, verdict] incomplete; com reason vazia então falha em [verdicts, legitimidade, reason] reason_required', () => {
    // C-2C-19
    const incomplete = parse(
      withVerdicts(VALID_BODY, {
        legitimidade: { verdict: null, reason: 'Critério atendido.' },
      }),
    );
    expect(issues(incomplete)).toContainEqual({
      path: ['verdicts', 'legitimidade', 'verdict'],
      message: 'rait.forms.triagem.verdicts.incomplete',
    });

    const noReason = parse(
      withVerdicts(VALID_BODY, {
        legitimidade: { verdict: true, reason: '' },
      }),
    );
    expect(issues(noReason)).toContainEqual({
      path: ['verdicts', 'legitimidade', 'reason'],
      message: 'rait.forms.triagem.verdicts.reason_required',
    });
  });

  it('dado R4 outcome admit com pedido_compativel.verdict false então falha em [outcome] admit_blocked; com context.timelinessVerdict false então idem; com timelinessVerdict null e vereditos true então success', () => {
    // C-2C-20
    const reproved = parse(
      withVerdicts(VALID_BODY, {
        pedido_compativel: { verdict: false, reason: 'Pedido incompatível.' },
      }),
    );
    expect(issues(reproved)).toContainEqual({
      path: ['outcome'],
      message: 'rait.forms.triagem.outcome.admit_blocked',
    });

    const untimely = parse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, timelinessVerdict: false },
    });
    expect(issues(untimely)).toContainEqual({
      path: ['outcome'],
      message: 'rait.forms.triagem.outcome.admit_blocked',
    });

    const unknownTimeliness = parse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, timelinessVerdict: null },
    });
    expect(unknownTimeliness.success).toBe(true);
  });

  it('dado R5 outcome reject com nonAdmissionReason ilegitimo e legitimidade.verdict true então falha mismatch; intempestivo com timelinessVerdict true então falha; intempestivo com timelinessVerdict null então sem essa issue', () => {
    // C-2C-21
    const mismatch = parse({
      ...VALID_BODY,
      outcome: 'reject',
      nonAdmissionReason: 'ilegitimo',
      nonAdmissionGrounds: ART4_GROUNDS,
    });
    expect(issues(mismatch)).toContainEqual({
      path: ['nonAdmissionReason'],
      message: 'rait.forms.triagem.nonAdmissionReason.mismatch',
    });

    const timelyMismatch = parse({
      ...VALID_BODY,
      outcome: 'reject',
      nonAdmissionReason: 'intempestivo',
      nonAdmissionGrounds: ART4_GROUNDS,
    });
    expect(issues(timelyMismatch)).toContainEqual({
      path: ['nonAdmissionReason'],
      message: 'rait.forms.triagem.nonAdmissionReason.mismatch',
    });

    const unknown = parse({
      ...VALID_BODY,
      outcome: 'reject',
      nonAdmissionReason: 'intempestivo',
      nonAdmissionGrounds: ART4_GROUNDS,
      context: { ...VALID_BODY.context, timelinessVerdict: null },
    });
    const mismatchIssues = unknown.success
      ? []
      : issues(unknown).filter(
          (issue) =>
            issue.message === 'rait.forms.triagem.nonAdmissionReason.mismatch',
        );
    expect(mismatchIssues).toEqual([]);
  });

  it('dado R6 context.caseState ADMITIDO então falha em [outcome] rait.forms.common.state_invalid; caseState null então success [negativo]', () => {
    // C-2C-22
    const invalidState = parse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, caseState: 'ADMITIDO' },
    });
    expect(issues(invalidState)).toContainEqual({
      path: ['outcome'],
      message: 'rait.forms.common.state_invalid',
    });

    const nullState = parse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, caseState: null },
    });
    expect(nullState.success).toBe(true);
  });

  it('dado TRIAGEM_GATE, TRIAGEM_ADMIT_GATE e TRIAGEM_REJECT_GATE então cada um toEqual à entrada homônima de GATES_FIXTURE', () => {
    // C-2C-23
    expect(TRIAGEM_GATE).toEqual(GATES_FIXTURE['TRIAGEM_GATE']);
    expect(TRIAGEM_ADMIT_GATE).toEqual(GATES_FIXTURE['TRIAGEM_ADMIT_GATE']);
    expect(TRIAGEM_REJECT_GATE).toEqual(GATES_FIXTURE['TRIAGEM_REJECT_GATE']);
  });
});
