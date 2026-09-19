// R-0014 TASK-0008 (Inspector). `forms/resposta-diligencia.schema.ts` (novo, contrato
// CTG-0003a §6.2; espelha `RequestDiligenceRespondDto`) — ainda não existe (TASK-0009): a
// importação falha com "Cannot find module" (estado esperado, §9 do contrato). Sem campo enum:
// sem caso "enum inválido".
import {
  RespostaDiligenciaSchema,
  RESPOSTA_DILIGENCIA_GATE,
} from './resposta-diligencia.schema';
import { RESPOSTA_DILIGENCIA_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = {
  text: 'Segue a documentação solicitada.',
  attachmentIds: ['00000000-0000-7000-8000-0000bb000004'],
};

describe('RespostaDiligenciaSchema', () => {
  it('dado o corpo canônico então safeParse.success', () => {
    // C-3a-93
    expect(RespostaDiligenciaSchema.safeParse(VALID_BODY).success).toBe(true);
  });

  it.each(['text', 'attachmentIds'] as const)(
    'dado o corpo sem %s então falha',
    (field) => {
      const { [field]: _omit, ...rest } = VALID_BODY;
      expect(RespostaDiligenciaSchema.safeParse(rest).success).toBe(false);
    },
  );

  it('dado chave extra então falha (strict)', () => {
    expect(
      RespostaDiligenciaSchema.safeParse({ ...VALID_BODY, extra: 1 }).success,
    ).toBe(false);
  });

  it('dado RESPOSTA_DILIGENCIA_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(RESPOSTA_DILIGENCIA_GATE).toEqual(RESPOSTA_DILIGENCIA_GATE_FIXTURE);
  });
});
