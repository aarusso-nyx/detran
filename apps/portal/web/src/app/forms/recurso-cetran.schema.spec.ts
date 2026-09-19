// R-0014 TASK-0008 (Inspector). `forms/recurso-cetran.schema.ts` (novo, contrato CTG-0003a
// §6.2) — ainda não existe (TASK-0009): a importação falha com "Cannot find module" (estado
// esperado, §9 do contrato). Sem campo enum no corpo: sem caso "enum inválido".
import {
  RecursoCetranSchema,
  RECURSO_CETRAN_GATE,
} from './recurso-cetran.schema';
import { RECURSO_CETRAN_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = {
  additionalText: 'Sinalização insuficiente no trecho.',
  attachmentIds: ['00000000-0000-7000-8000-0000bb000003'],
};

describe('RecursoCetranSchema', () => {
  it('dado o corpo canônico então safeParse.success; additionalText é opcional', () => {
    // C-3a-93
    expect(RecursoCetranSchema.safeParse(VALID_BODY).success).toBe(true);
    const { additionalText: _omit, ...withoutOptional } = VALID_BODY;
    expect(RecursoCetranSchema.safeParse(withoutOptional).success).toBe(true);
  });

  it('dado o corpo sem attachmentIds então falha', () => {
    const { attachmentIds: _omit, ...rest } = VALID_BODY;
    expect(RecursoCetranSchema.safeParse(rest).success).toBe(false);
  });

  it('dado chave extra então falha (strict)', () => {
    expect(
      RecursoCetranSchema.safeParse({ ...VALID_BODY, extra: 1 }).success,
    ).toBe(false);
  });

  it('dado RECURSO_CETRAN_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(RECURSO_CETRAN_GATE).toEqual(RECURSO_CETRAN_GATE_FIXTURE);
  });
});
