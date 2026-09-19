// R-0014 TASK-0008 (Inspector). `forms/desistencia.schema.ts` (novo, contrato CTG-0003a §6.2;
// espelha `RequestWithdrawDto` do OpenAPI, não o schema JSON de rascunho) — ainda não existe
// (TASK-0009): a importação falha com "Cannot find module" (estado esperado, §9 do contrato).
// Sem campo enum: sem caso "enum inválido"; `confirm` é `z.literal(true)`, testado como o
// "obrigatório" desta forma.
import { DesistenciaSchema, DESISTENCIA_GATE } from './desistencia.schema';
import { DESISTENCIA_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = { confirm: true as const, reason: 'Pagamento à vista.' };

describe('DesistenciaSchema', () => {
  it('dado o corpo canônico (RequestWithdrawDto) então safeParse.success; reason é opcional', () => {
    // C-3a-93
    expect(DesistenciaSchema.safeParse(VALID_BODY).success).toBe(true);
    expect(DesistenciaSchema.safeParse({ confirm: true }).success).toBe(true);
  });

  it('dado o corpo sem confirm então falha', () => {
    const { confirm: _omit, ...rest } = VALID_BODY;
    expect(DesistenciaSchema.safeParse(rest).success).toBe(false);
  });

  it('dado confirm false então falha (literal true)', () => {
    expect(
      DesistenciaSchema.safeParse({ ...VALID_BODY, confirm: false }).success,
    ).toBe(false);
  });

  it('dado chave extra então falha (strict)', () => {
    expect(
      DesistenciaSchema.safeParse({ ...VALID_BODY, extra: 1 }).success,
    ).toBe(false);
  });

  it('dado DESISTENCIA_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(DESISTENCIA_GATE).toEqual(DESISTENCIA_GATE_FIXTURE);
  });
});
