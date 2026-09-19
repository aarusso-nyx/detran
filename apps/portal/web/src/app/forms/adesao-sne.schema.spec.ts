// R-0014 TASK-0008 (Inspector). `forms/adesao-sne.schema.ts` (novo, contrato CTG-0003a §6.2) —
// ainda não existe (TASK-0009): a importação falha com "Cannot find module" (estado esperado,
// §9 do contrato). `effectsAck` usa o enum do schema JSON/OpenAPI (`ciencia_ficta`,
// `canal_exclusivo`, `desconto_60`, `cancelamento` — [DIVERGE-2]/OD-P61), não os nomes de
// [RN-PORTAL-123] usados nos TEXTOS do diálogo (A5). `email`/`phone` obrigatórios na submissão
// ([DIVERGE-21]).
import { AdesaoSneSchema, ADESAO_SNE_GATE } from './adesao-sne.schema';
import { ADESAO_SNE_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = {
  email: 'cidada.prata@fixtures.invalid',
  phone: '92991234567',
  consent: {
    textVersion: 'v1',
    effectsAck: [
      'ciencia_ficta',
      'canal_exclusivo',
      'desconto_60',
      'cancelamento',
    ] as const,
  },
};

describe('AdesaoSneSchema', () => {
  it('dado o corpo canônico com os quatro efeitos então safeParse.success', () => {
    // C-3a-93, C-3a-96 (parte 1)
    expect(AdesaoSneSchema.safeParse(VALID_BODY).success).toBe(true);
  });

  it('dado effectsAck com 3 itens então falha', () => {
    // C-3a-96 (parte 2)
    const result = AdesaoSneSchema.safeParse({
      ...VALID_BODY,
      consent: {
        ...VALID_BODY.consent,
        effectsAck: ['ciencia_ficta', 'canal_exclusivo', 'desconto_60'],
      },
    });
    expect(result.success).toBe(false);
  });

  it('dado sem email então falha', () => {
    // C-3a-96 (parte 3)
    const { email: _omit, ...rest } = VALID_BODY;
    expect(AdesaoSneSchema.safeParse(rest).success).toBe(false);
  });

  it('dado sem phone então falha', () => {
    // C-3a-96 (parte 4)
    const { phone: _omit, ...rest } = VALID_BODY;
    expect(AdesaoSneSchema.safeParse(rest).success).toBe(false);
  });

  it('dado sem consent então falha', () => {
    const { consent: _omit, ...rest } = VALID_BODY;
    expect(AdesaoSneSchema.safeParse(rest).success).toBe(false);
  });

  it('dado efeito fora do enum então falha', () => {
    const result = AdesaoSneSchema.safeParse({
      ...VALID_BODY,
      consent: { ...VALID_BODY.consent, effectsAck: ['invalido'] },
    });
    expect(result.success).toBe(false);
  });

  it('dado chave extra então falha (strict)', () => {
    expect(AdesaoSneSchema.safeParse({ ...VALID_BODY, extra: 1 }).success).toBe(
      false,
    );
  });

  it('dado ADESAO_SNE_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(ADESAO_SNE_GATE).toEqual(ADESAO_SNE_GATE_FIXTURE);
  });
});
