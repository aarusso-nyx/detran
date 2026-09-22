// R-0012 TASK-0011 (Inspector). `forms/parecer-voto.schema.ts` (contrato CTG-0002c §4.6) —
// ainda não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-38 e C-2C-39 (§8).
import type { z } from 'zod';
import { PARECER_VOTO_GATE, ParecerVotoSchema } from './parecer-voto.schema';
import { GATES_FIXTURE } from '../../testing/gates.fixture';

/** Corpo canônico do §8 C-2C-38. */
const VALID_BODY = {
  summary: 'Relato do caso.',
  analysis: 'Análise fundamentada do mérito.',
  vote: 'nao_provimento',
  context: { memberImpeded: false, caseState: 'EM_INSTRUCAO' },
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

describe('ParecerVotoSchema', () => {
  it('dado o corpo canônico (summary, analysis, vote nao_provimento) quando safeParse então success; R1 vote "abstencao" então falha (enum) [negativo]', () => {
    // C-2C-38 (partes 1 e 3)
    expect(ParecerVotoSchema.safeParse(VALID_BODY).success).toBe(true);

    const abstention = ParecerVotoSchema.safeParse({
      ...VALID_BODY,
      vote: 'abstencao',
    });
    expect(issues(abstention)[0].path).toEqual(['vote']);
  });

  it.each(['summary', 'analysis', 'vote'] as const)(
    'dado o corpo sem %s quando safeParse então falha no path do campo [negativo]',
    (field: keyof Body) => {
      // C-2C-38 (parte 2)
      const { [field]: _omit, ...rest } = VALID_BODY;
      expect(issues(ParecerVotoSchema.safeParse(rest))[0].path).toEqual([
        field,
      ]);
    },
  );

  it('dado R2 memberImpeded true então falha em [vote] vote.impeded; R3 caseState PAUTADO então rait.forms.common.state_invalid; PARECER_VOTO_GATE toEqual fixture', () => {
    // C-2C-39
    const impeded = ParecerVotoSchema.safeParse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, memberImpeded: true },
    });
    expect(issues(impeded)).toContainEqual({
      path: ['vote'],
      message: 'rait.forms.parecer-voto.vote.impeded',
    });

    const wrongState = ParecerVotoSchema.safeParse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, caseState: 'PAUTADO' },
    });
    expect(issues(wrongState)).toContainEqual({
      path: ['vote'],
      message: 'rait.forms.common.state_invalid',
    });

    expect(PARECER_VOTO_GATE).toEqual(GATES_FIXTURE['PARECER_VOTO_GATE']);
  });
});
