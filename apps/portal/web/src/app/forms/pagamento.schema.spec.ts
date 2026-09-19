// R-0014 TASK-0008 (Inspector). `forms/pagamento.schema.ts` (novo, contrato CTG-0003a §6.2) —
// ainda não existe (TASK-0009): a importação falha com "Cannot find module" (estado esperado,
// §9 do contrato).
import { PagamentoSchema, PAGAMENTO_GATE } from './pagamento.schema';
import { PAGAMENTO_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = {
  tier: 'desconto_80' as const,
  method: 'pix' as const,
};

describe('PagamentoSchema', () => {
  it('dado o corpo canônico então safeParse.success', () => {
    // C-3a-93
    expect(PagamentoSchema.safeParse(VALID_BODY).success).toBe(true);
  });

  it.each(['tier', 'method'] as const)(
    'dado o corpo sem %s então falha',
    (field) => {
      const { [field]: _omit, ...rest } = VALID_BODY;
      expect(PagamentoSchema.safeParse(rest).success).toBe(false);
    },
  );

  it('dado tier inválido então falha (enum)', () => {
    expect(
      PagamentoSchema.safeParse({ ...VALID_BODY, tier: 'invalido' }).success,
    ).toBe(false);
  });

  it('dado chave extra então falha (strict)', () => {
    expect(PagamentoSchema.safeParse({ ...VALID_BODY, extra: 1 }).success).toBe(
      false,
    );
  });

  it('dado desconto_40_fora_sne sem waiverAck então falha em waiverAck; com waiverAck{textVersion,acceptedAt} então sucesso; installments 0 então falha', () => {
    // C-3a-95
    const withoutAck = PagamentoSchema.safeParse({
      tier: 'desconto_40_fora_sne',
      method: 'pix',
    });
    expect(withoutAck.success).toBe(false);

    const withAck = PagamentoSchema.safeParse({
      tier: 'desconto_40_fora_sne',
      method: 'pix',
      waiverAck: { textVersion: 'v1', acceptedAt: '2026-09-14T12:00:00-04:00' },
    });
    expect(withAck.success).toBe(true);

    const zeroInstallments = PagamentoSchema.safeParse({
      ...VALID_BODY,
      installments: 0,
    });
    expect(zeroInstallments.success).toBe(false);
  });

  it('dado PAGAMENTO_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(PAGAMENTO_GATE).toEqual(PAGAMENTO_GATE_FIXTURE);
  });
});
