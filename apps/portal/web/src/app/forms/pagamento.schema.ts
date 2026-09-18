// Pagamento (contrato CTG-0003a §6.2; schema JSON `pagamento`). A faixa `desconto_40_fora_sne`
// exige `waiverAck` completo (declaração de reconhecimento + versão do texto, `renuncia_40`).
import { z } from 'zod';
import { ConsequenceAckSchema, type FormGate } from './form-gate';

export const PagamentoSchema = z
  .strictObject({
    tier: z.enum([
      'desconto_80',
      'desconto_60_reconhecimento',
      'desconto_40_fora_sne',
      'integral_juros',
    ]),
    method: z.enum(['pix', 'debito', 'boleto', 'cartao']),
    installments: z.number().int().min(1).optional(),
    waiverAck: ConsequenceAckSchema.partial().optional(),
  })
  .refine(
    (value) =>
      value.tier !== 'desconto_40_fora_sne' ||
      Boolean(value.waiverAck?.textVersion && value.waiverAck?.acceptedAt),
    { path: ['waiverAck'] },
  );

export type PagamentoBody = z.infer<typeof PagamentoSchema>;

export const PAGAMENTO_GATE: FormGate = {
  serviceKey: 'pagamento',
  actKey: 'pagamento',
  minimumAssurance: 'simples',
  precondition: {
    state: null,
    timer: null,
    note: 'faixa disponível para a fase (80/60/40); 60% só com SNE; 40% exige declaracao_reconhecimento + versão do texto',
    violation: 'PORTAL.PAYMENT_TIER_NOT_AVAILABLE',
    warning: null,
  },
  command: 'submit',
  effect:
    'inf:collection:issue → { documentId, barcode | pixCopyPaste, amount, validUntil }',
};
