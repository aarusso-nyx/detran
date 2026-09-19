// R-0014 TASK-0008 (Inspector). `forms/junta-medica.schema.ts` (novo, contrato CTG-0003a §6.2)
// — ainda não existe (TASK-0009): a importação falha com "Cannot find module" (estado esperado,
// §9 do contrato). Sem campo enum: sem caso "enum inválido"; `junta_medica` fora do catálogo de
// serviços desta rodada (OD-P19), mas mantém corpo próprio no contrato de rotas.
import { JuntaMedicaSchema, JUNTA_MEDICA_GATE } from './junta-medica.schema';
import { JUNTA_MEDICA_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = {
  examId: '00000000-0000-7000-8000-00007ff00002',
  reason: 'Discordância do resultado do exame toxicológico.',
  attachmentIds: ['00000000-0000-7000-8000-0000bb000005'],
};

describe('JuntaMedicaSchema', () => {
  it('dado o corpo canônico então safeParse.success', () => {
    // C-3a-93
    expect(JuntaMedicaSchema.safeParse(VALID_BODY).success).toBe(true);
  });

  it.each(['examId', 'reason', 'attachmentIds'] as const)(
    'dado o corpo sem %s então falha',
    (field) => {
      const { [field]: _omit, ...rest } = VALID_BODY;
      expect(JuntaMedicaSchema.safeParse(rest).success).toBe(false);
    },
  );

  it('dado examId fora da forma uuid então falha', () => {
    expect(
      JuntaMedicaSchema.safeParse({ ...VALID_BODY, examId: 'x' }).success,
    ).toBe(false);
  });

  it('dado chave extra então falha (strict)', () => {
    expect(
      JuntaMedicaSchema.safeParse({ ...VALID_BODY, extra: 1 }).success,
    ).toBe(false);
  });

  it('dado JUNTA_MEDICA_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(JUNTA_MEDICA_GATE).toEqual(JUNTA_MEDICA_GATE_FIXTURE);
  });
});
