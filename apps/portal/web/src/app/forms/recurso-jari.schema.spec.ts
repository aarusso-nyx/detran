// R-0014 TASK-0008 (Inspector). `forms/recurso-jari.schema.ts` (novo, contrato CTG-0003a §6.2)
// — ainda não existe (TASK-0009): a importação falha com "Cannot find module" (estado esperado,
// §9 do contrato). Sem campo enum no corpo (schema JSON §5.1): sem caso "enum inválido".
import { RecursoJariSchema, RECURSO_JARI_GATE } from './recurso-jari.schema';
import { RECURSO_JARI_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = {
  grounds: 'Ausência de sinalização regulamentar.',
  attachmentIds: ['00000000-0000-7000-8000-0000bb000002'],
};

describe('RecursoJariSchema', () => {
  it('dado o corpo canônico então safeParse.success', () => {
    // C-3a-93
    expect(RecursoJariSchema.safeParse(VALID_BODY).success).toBe(true);
  });

  it.each(['grounds', 'attachmentIds'] as const)(
    'dado o corpo sem %s então falha no path do campo',
    (field) => {
      const { [field]: _omit, ...rest } = VALID_BODY;
      expect(RecursoJariSchema.safeParse(rest).success).toBe(false);
    },
  );

  it('dado chave extra então falha (strict)', () => {
    expect(
      RecursoJariSchema.safeParse({ ...VALID_BODY, extra: 1 }).success,
    ).toBe(false);
  });

  it('dado RECURSO_JARI_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(RECURSO_JARI_GATE).toEqual(RECURSO_JARI_GATE_FIXTURE);
  });
});
