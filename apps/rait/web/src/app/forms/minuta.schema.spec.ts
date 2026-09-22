// R-0012 TASK-0011 (Inspector). `forms/minuta.schema.ts` (contrato CTG-0002c §4.4) — ainda não
// existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado, contrato
// §1). Critérios C-2C-29 e C-2C-30 (§8).
import type { z } from 'zod';
import { MINUTA_GATE, MinutaSchema } from './minuta.schema';
import { GATES_FIXTURE } from '../../testing/gates.fixture';

/** Corpo canônico do §8 C-2C-29. */
const VALID_BODY = {
  facts: 'O condutor não estava no local.',
  grounds: 'Ausência de nexo causal.',
  ruling: 'acolher',
  context: { caseState: 'EM_INSTRUCAO' },
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

describe('MinutaSchema', () => {
  it('dado o corpo canônico (facts, grounds, ruling acolher, caseState EM_INSTRUCAO) quando safeParse então success', () => {
    // C-2C-29 (parte 1)
    expect(MinutaSchema.safeParse(VALID_BODY).success).toBe(true);
  });

  it.each(['facts', 'grounds', 'ruling'] as const)(
    'dado o corpo sem %s quando safeParse então falha no path do campo [negativo]',
    (field: keyof Body) => {
      // C-2C-29 (parte 2)
      const { [field]: _omit, ...rest } = VALID_BODY;
      expect(issues(MinutaSchema.safeParse(rest))[0].path).toEqual([field]);
    },
  );

  it('dado R1 ruling "acolhida" então falha em [ruling] (enum) [negativo]; R2 caseState PRONTO_P_DECISAO então falha em [ruling] state_invalid; MINUTA_GATE toEqual fixture', () => {
    // C-2C-30
    const badRuling = MinutaSchema.safeParse({
      ...VALID_BODY,
      ruling: 'acolhida',
    });
    expect(issues(badRuling)[0].path).toEqual(['ruling']);

    const invalidState = MinutaSchema.safeParse({
      ...VALID_BODY,
      context: { caseState: 'PRONTO_P_DECISAO' },
    });
    expect(issues(invalidState)).toContainEqual({
      path: ['ruling'],
      message: 'rait.forms.common.state_invalid',
    });

    expect(MINUTA_GATE).toEqual(GATES_FIXTURE['MINUTA_GATE']);
  });
});
