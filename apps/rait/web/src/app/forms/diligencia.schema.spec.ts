// R-0012 TASK-0011 (Inspector). `forms/diligencia.schema.ts` (contrato CTG-0002c §4.3) — ainda
// não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-24…28 (§8). `today` = dia civil de `FIXED_NOW_ISO`; o "dia
// seguinte" é string fixa do spec ([RN-RAIT-005]: nenhuma contagem de dias no cliente).
import type { z } from 'zod';
import {
  DILIGENCIA_ANSWER_GATE,
  DILIGENCIA_EXTEND_GATE,
  DILIGENCIA_GATE,
  DILIGENCIA_MASKS,
  DiligenciaProrrogacaoSchema,
  DiligenciaSchema,
} from './diligencia.schema';
import { FIXED_NOW_ISO } from '../../testing/clock.stub';
import { GATES_FIXTURE } from '../../testing/gates.fixture';

const TODAY = FIXED_NOW_ISO.slice(0, 10); // '2026-09-14'
const TOMORROW = '2026-09-15'; // literal fixo, nunca calculado

/** Corpo canônico do §8 C-2C-24. */
const VALID_BODY = {
  addressee: 'orgao_autuador',
  subject: 'Cópia do auto de infração',
  dueOn: null,
  officialDocument: true,
  context: { today: TODAY, caseState: 'EM_INSTRUCAO' },
};

/** Corpo canônico da prorrogação (§8 C-2C-27). */
const VALID_EXTENSION = {
  reason: 'Prazo insuficiente para a resposta.',
  context: { extensionCount: 0, outcome: null },
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

describe('DiligenciaSchema', () => {
  it('dado o corpo canônico quando safeParse então success; dado o corpo sem subject então falha em [subject]', () => {
    // C-2C-24
    expect(DiligenciaSchema.safeParse(VALID_BODY).success).toBe(true);

    const { subject: _omit, ...withoutSubject } = VALID_BODY;
    expect(issues(DiligenciaSchema.safeParse(withoutSubject))[0].path).toEqual([
      'subject',
    ]);
  });

  it('dado R1 addressee requerente com officialDocument true então falha em [addressee] official_document; com officialDocument false então success', () => {
    // C-2C-25
    const blocked = DiligenciaSchema.safeParse({
      ...VALID_BODY,
      addressee: 'requerente',
      officialDocument: true,
    });
    expect(issues(blocked)).toContainEqual({
      path: ['addressee'],
      message: 'rait.forms.diligencia.addressee.official_document',
    });

    const allowed = DiligenciaSchema.safeParse({
      ...VALID_BODY,
      addressee: 'requerente',
      officialDocument: false,
    });
    expect(allowed.success).toBe(true);
  });

  it('dado R2 dueOn = today então falha em [dueOn] rait.forms.common.date_past; dueOn = dia seguinte (string fixa) então success; dueOn null então success', () => {
    // C-2C-26
    expect(TODAY).toBe('2026-09-14'); // âncora da string fixa TOMORROW
    const past = DiligenciaSchema.safeParse({ ...VALID_BODY, dueOn: TODAY });
    expect(issues(past)).toContainEqual({
      path: ['dueOn'],
      message: 'rait.forms.common.date_past',
    });

    expect(
      DiligenciaSchema.safeParse({ ...VALID_BODY, dueOn: TOMORROW }).success,
    ).toBe(true);
    expect(
      DiligenciaSchema.safeParse({ ...VALID_BODY, dueOn: null }).success,
    ).toBe(true);
  });

  it('dado R3/R4 DiligenciaProrrogacaoSchema com extensionCount 0 e outcome null então success; extensionCount 1 então falha em [] extension.limit; outcome respondida então falha em [] extension.closed', () => {
    // C-2C-27
    expect(DiligenciaProrrogacaoSchema.safeParse(VALID_EXTENSION).success).toBe(
      true,
    );

    const limit = DiligenciaProrrogacaoSchema.safeParse({
      ...VALID_EXTENSION,
      context: { extensionCount: 1, outcome: null },
    });
    expect(issues(limit)).toContainEqual({
      path: [],
      message: 'rait.forms.diligencia.extension.limit',
    });

    const closed = DiligenciaProrrogacaoSchema.safeParse({
      ...VALID_EXTENSION,
      context: { extensionCount: 0, outcome: 'respondida' },
    });
    expect(issues(closed)).toContainEqual({
      path: [],
      message: 'rait.forms.diligencia.extension.closed',
    });
  });

  it('dado R5 caseState DILIGENCIA então falha em [subject] state_invalid; DILIGENCIA_GATE, DILIGENCIA_ANSWER_GATE e DILIGENCIA_EXTEND_GATE toEqual às fixtures; DILIGENCIA_MASKS { dueOn: date }', () => {
    // C-2C-28
    const invalidState = DiligenciaSchema.safeParse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, caseState: 'DILIGENCIA' },
    });
    expect(issues(invalidState)).toContainEqual({
      path: ['subject'],
      message: 'rait.forms.common.state_invalid',
    });

    expect(DILIGENCIA_GATE).toEqual(GATES_FIXTURE['DILIGENCIA_GATE']);
    expect(DILIGENCIA_ANSWER_GATE).toEqual(
      GATES_FIXTURE['DILIGENCIA_ANSWER_GATE'],
    );
    expect(DILIGENCIA_EXTEND_GATE).toEqual(
      GATES_FIXTURE['DILIGENCIA_EXTEND_GATE'],
    );
    expect(DILIGENCIA_MASKS).toEqual({ dueOn: 'date' });
  });
});
