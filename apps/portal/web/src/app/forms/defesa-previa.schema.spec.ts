// R-0014 TASK-0008 (Inspector). `forms/defesa-previa.schema.ts` (novo, contrato CTG-0003a
// §6.2) — ainda não existe (TASK-0009): a importação falha com "Cannot find module" (estado
// esperado, §9 do contrato).
import { DefesaPreviaSchema, DEFESA_PREVIA_GATE } from './defesa-previa.schema';
import { DEFESA_PREVIA_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = {
  facts: 'O condutor não estava no local.',
  grounds: 'Ausência de nexo causal.',
  attachmentIds: ['00000000-0000-7000-8000-0000bb000001'],
  requestType: 'outro' as const,
};

describe('DefesaPreviaSchema', () => {
  it('dado o corpo canônico (schema JSON §5.1) então safeParse.success', () => {
    // C-3a-93 (parte 1)
    expect(DefesaPreviaSchema.safeParse(VALID_BODY).success).toBe(true);
  });

  it.each(['facts', 'grounds', 'attachmentIds', 'requestType'] as const)(
    'dado o corpo sem %s então falha no path do campo',
    (field) => {
      // C-3a-93 (parte 2)
      const { [field]: _omit, ...rest } = VALID_BODY;
      const result = DefesaPreviaSchema.safeParse(rest);
      expect(result.success).toBe(false);
    },
  );

  it('dado requestType inválido então falha (enum)', () => {
    // C-3a-93 (parte 3)
    const result = DefesaPreviaSchema.safeParse({
      ...VALID_BODY,
      requestType: 'invalido',
    });
    expect(result.success).toBe(false);
  });

  it('dado chave extra então falha (strict, additionalProperties: false)', () => {
    // C-3a-93 (parte 4)
    const result = DefesaPreviaSchema.safeParse({
      ...VALID_BODY,
      extra: true,
    });
    expect(result.success).toBe(false);
  });

  it('dado DEFESA_PREVIA_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(DEFESA_PREVIA_GATE).toEqual(DEFESA_PREVIA_GATE_FIXTURE);
  });
});
