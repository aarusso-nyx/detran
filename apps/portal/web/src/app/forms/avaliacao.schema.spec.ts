// R-0014 TASK-0008 (Inspector). `forms/avaliacao.schema.ts` (novo, contrato CTG-0003a §6.2;
// espelha `RequestEvaluateDto`) — ainda não existe (TASK-0009): a importação falha com "Cannot
// find module" (estado esperado, §9 do contrato). Escala das notas: `source_pending` (OD-P65) —
// só o formato (inteiro) é verificado aqui, nunca um intervalo inventado.
import { AvaliacaoSchema, AVALIACAO_GATE } from './avaliacao.schema';
import { AVALIACAO_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = {
  scores: {
    satisfaction: 5,
    quality: 5,
    deadline: 5,
    clarity: 5,
    channel: 5,
  },
};

describe('AvaliacaoSchema', () => {
  it('dado o corpo canônico então safeParse.success; comment é opcional', () => {
    // C-3a-93
    expect(AvaliacaoSchema.safeParse(VALID_BODY).success).toBe(true);
    expect(
      AvaliacaoSchema.safeParse({ ...VALID_BODY, comment: 'Bom atendimento.' })
        .success,
    ).toBe(true);
  });

  it('dado o corpo sem scores então falha', () => {
    expect(AvaliacaoSchema.safeParse({}).success).toBe(false);
  });

  it.each([
    'satisfaction',
    'quality',
    'deadline',
    'clarity',
    'channel',
  ] as const)('dado scores sem %s então falha', (field) => {
    const { [field]: _omit, ...rest } = VALID_BODY.scores;
    expect(AvaliacaoSchema.safeParse({ scores: rest }).success).toBe(false);
  });

  it('dado nota não inteira então falha', () => {
    expect(
      AvaliacaoSchema.safeParse({
        scores: { ...VALID_BODY.scores, satisfaction: 4.5 },
      }).success,
    ).toBe(false);
  });

  it('dado chave extra então falha (strict)', () => {
    expect(AvaliacaoSchema.safeParse({ ...VALID_BODY, extra: 1 }).success).toBe(
      false,
    );
  });

  it('dado AVALIACAO_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(AVALIACAO_GATE).toEqual(AVALIACAO_GATE_FIXTURE);
  });
});
