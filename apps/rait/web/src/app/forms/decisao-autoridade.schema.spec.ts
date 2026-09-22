// R-0012 TASK-0011 (Inspector). `forms/decisao-autoridade.schema.ts` (contrato CTG-0002c §4.5) —
// ainda não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-31…37 (§8). Circunscrição, escala, autoria da minuta e
// disponibilidade da assinatura são fatos do servidor espelhados em `context` (§2.4).
import type { z } from 'zod';
import {
  DECISAO_AUTORIDADE_GATE,
  DECISAO_AUTORIDADE_RETURN_GATE,
  DecisaoAutoridadeSchema,
  DecisaoDevolucaoSchema,
} from './decisao-autoridade.schema';
import { GATES_FIXTURE } from '../../testing/gates.fixture';

/** Corpo canônico do §8 C-2C-31. */
const VALID_BODY = {
  kind: 'indeferida',
  grounds: 'Defesa não infirma a autuação.',
  signature: null,
  context: {
    jurisdictionMatches: true,
    onDuty: true,
    isDraftAuthor: false,
    signatureAvailable: false,
    instance: 'defesa_previa',
    caseState: 'PRONTO_P_DECISAO',
  },
};

/** Corpo canônico da devolução (§8 C-2C-36). */
const VALID_RETURN = {
  returnGuidance: 'Rever a fundamentação do item 3.',
  context: { returnCount: 0 },
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

function withContext(patch: Record<string, unknown>): Record<string, unknown> {
  return { ...VALID_BODY, context: { ...VALID_BODY.context, ...patch } };
}

describe('DecisaoAutoridadeSchema', () => {
  it('dado o corpo canônico quando safeParse então success; kind "provido" então falha (enum); grounds vazio então falha em [grounds]', () => {
    // C-2C-31
    expect(DecisaoAutoridadeSchema.safeParse(VALID_BODY).success).toBe(true);

    const badKind = DecisaoAutoridadeSchema.safeParse({
      ...VALID_BODY,
      kind: 'provido',
    });
    expect(issues(badKind)[0].path).toEqual(['kind']);

    const emptyGrounds = DecisaoAutoridadeSchema.safeParse({
      ...VALID_BODY,
      grounds: '',
    });
    expect(issues(emptyGrounds)[0].path).toEqual(['grounds']);
  });

  it('dado R1 jurisdictionMatches false então falha em [kind] context.jurisdiction; jurisdictionMatches null então success', () => {
    // C-2C-32
    const outOfJurisdiction = DecisaoAutoridadeSchema.safeParse(
      withContext({ jurisdictionMatches: false }),
    );
    expect(issues(outOfJurisdiction)).toContainEqual({
      path: ['kind'],
      message: 'rait.forms.decisao-autoridade.context.jurisdiction',
    });

    expect(
      DecisaoAutoridadeSchema.safeParse(
        withContext({ jurisdictionMatches: null }),
      ).success,
    ).toBe(true);
  });

  it('dado R2 onDuty false então context.not_on_duty; isDraftAuthor true então context.draft_author', () => {
    // C-2C-33
    const offDuty = DecisaoAutoridadeSchema.safeParse(
      withContext({ onDuty: false }),
    );
    expect(issues(offDuty)).toContainEqual({
      path: ['kind'],
      message: 'rait.forms.decisao-autoridade.context.not_on_duty',
    });

    const author = DecisaoAutoridadeSchema.safeParse(
      withContext({ isDraftAuthor: true }),
    );
    expect(issues(author)).toContainEqual({
      path: ['kind'],
      message: 'rait.forms.decisao-autoridade.context.draft_author',
    });
  });

  it('dado R3 signatureAvailable true com signature null então falha em [signature] signature.required; com signature { kind, ref } então success', () => {
    // C-2C-34
    const missing = DecisaoAutoridadeSchema.safeParse(
      withContext({ signatureAvailable: true }),
    );
    expect(issues(missing)).toContainEqual({
      path: ['signature'],
      message: 'rait.forms.decisao-autoridade.signature.required',
    });

    const signed = DecisaoAutoridadeSchema.safeParse({
      ...withContext({ signatureAvailable: true }),
      signature: { kind: 'pades', ref: 'x' },
    });
    expect(signed.success).toBe(true);
  });

  it('dado R4 instance jari então falha em [kind] context.instance; R5 caseState EM_INSTRUCAO então rait.forms.common.state_invalid', () => {
    // C-2C-35
    const wrongInstance = DecisaoAutoridadeSchema.safeParse(
      withContext({ instance: 'jari' }),
    );
    expect(issues(wrongInstance)).toContainEqual({
      path: ['kind'],
      message: 'rait.forms.decisao-autoridade.context.instance',
    });

    const wrongState = DecisaoAutoridadeSchema.safeParse(
      withContext({ caseState: 'EM_INSTRUCAO' }),
    );
    expect(issues(wrongState)).toContainEqual({
      path: ['kind'],
      message: 'rait.forms.common.state_invalid',
    });
  });

  it('dado R6 DecisaoDevolucaoSchema com returnCount 0 então success; returnCount 1 então falha em [] returnGuidance.limit; returnGuidance vazio então falha em [returnGuidance]', () => {
    // C-2C-36
    expect(DecisaoDevolucaoSchema.safeParse(VALID_RETURN).success).toBe(true);

    const limit = DecisaoDevolucaoSchema.safeParse({
      ...VALID_RETURN,
      context: { returnCount: 1 },
    });
    expect(issues(limit)).toContainEqual({
      path: [],
      message: 'rait.forms.decisao-autoridade.returnGuidance.limit',
    });

    const empty = DecisaoDevolucaoSchema.safeParse({
      ...VALID_RETURN,
      returnGuidance: '',
    });
    expect(issues(empty)[0].path).toEqual(['returnGuidance']);
  });

  it('dado DECISAO_AUTORIDADE_GATE e DECISAO_AUTORIDADE_RETURN_GATE então toEqual às fixtures', () => {
    // C-2C-37
    expect(DECISAO_AUTORIDADE_GATE).toEqual(
      GATES_FIXTURE['DECISAO_AUTORIDADE_GATE'],
    );
    expect(DECISAO_AUTORIDADE_RETURN_GATE).toEqual(
      GATES_FIXTURE['DECISAO_AUTORIDADE_RETURN_GATE'],
    );
  });
});
