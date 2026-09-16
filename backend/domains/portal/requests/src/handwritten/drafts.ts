// Corpos por ato (`DRAFT_SCHEMAS`, work/rounds/R-0009/contracts/CTG-0002.md
// §3.4 — transcrição zod da forma de portal-route-contract.md §5.1; a
// semântica é do domínio dono, nunca validada aqui) e a tabela
// `CONSEQUENCE_ACK_KIND_BY_SERVICE` (§3.1 passo 6; `portal.consequence_ack.kind`
// do DDL 62). `manifestar`/`avaliar` não têm rascunho (rota própria).
import { z } from 'zod';

const uuidList = z.array(z.uuid());

const ack = z.strictObject({
  textVersion: z.string(),
  acceptedAt: z.iso.datetime(),
});

/** Os quatro efeitos do consentimento SNE (§2.4; UC-PORTAL-007 AC-2). */
export const SNE_EFFECTS = [
  'ciencia_ficta',
  'canal_exclusivo',
  'desconto_60',
  'cancelamento',
] as const;

/**
 * `SNE_ENROLLMENT_BODY` (§2.4) sem `channel` (§3.4 `adesao_sne`): os quatro
 * efeitos são obrigatórios e sem repetição.
 */
export const SNE_ENROLLMENT_DRAFT = z.strictObject({
  email: z.email().optional(),
  phone: z
    .string()
    .regex(/^\d{10,11}$/)
    .optional(),
  consent: z.strictObject({
    textVersion: z.string().min(1),
    effectsAck: z
      .array(z.enum(SNE_EFFECTS))
      .min(4)
      .refine((effects) => new Set(effects).size === SNE_EFFECTS.length, {
        message: 'consent.effectsAck',
      }),
  }),
});

const emptyDraft = z.strictObject({});

export const DRAFT_SCHEMAS = {
  defesa_previa: z.strictObject({
    facts: z.string(),
    grounds: z.string(),
    attachmentIds: uuidList,
    requestType: z.enum(['cancelamento', 'outro']),
  }),
  recurso_jari: z.strictObject({
    grounds: z.string(),
    attachmentIds: uuidList,
  }),
  recurso_cetran: z.strictObject({
    additionalText: z.string().optional(),
    attachmentIds: uuidList,
  }),
  indicacao_condutor: z.strictObject({
    driver: z.strictObject({
      cpf: z.string().regex(/^\d{11}$/),
      cnhNumber: z.string(),
      cnhUf: z.string().length(2),
      category: z.string(),
      name: z.string(),
    }),
    signatures: z.strictObject({
      owner: z.enum(['govbr', 'upload']),
      driver: z.enum(['govbr', 'upload', 'pending']),
    }),
    consequenceAck: ack,
  }),
  pagamento: z.strictObject({
    tier: z.enum([
      'desconto_80',
      'desconto_60_reconhecimento',
      'desconto_40_fora_sne',
      'integral_juros',
    ]),
    method: z.enum(['pix', 'debito', 'boleto', 'cartao']),
    installments: z.int().min(1).optional(),
    waiverAck: ack.optional(),
  }),
  adesao_sne: SNE_ENROLLMENT_DRAFT,
  cancelamento_sne: z.strictObject({
    reason: z.string().max(2000).optional(),
  }),
  junta_medica: z.strictObject({
    examId: z.uuid(),
    reason: z.string(),
    attachmentIds: uuidList,
  }),
  lgpd_declaracao: z.strictObject({
    scope: z.enum([
      'confirmacao',
      'declaracao_completa',
      'correcao',
      'eliminacao',
    ]),
    fields: z.array(z.string()).optional(),
  }),
  consulta_multas: emptyDraft,
  consulta_cnh: emptyDraft,
  consulta_bat: emptyDraft,
  consulta_exame: emptyDraft,
  emissao_crlv: emptyDraft,
} as const;

export type DraftServiceKey = keyof typeof DRAFT_SCHEMAS;

/** Serviços cujo `submit` exige `consequenceAck` (§3.1 passo 6). */
export const CONSEQUENCE_ACK_KIND_BY_SERVICE: Readonly<
  Record<string, 'sne' | 'indicacao'>
> = {
  adesao_sne: 'sne',
  indicacao_condutor: 'indicacao',
};

/**
 * Serviços com rota própria ([WF-PORTAL-001] §Catálogo → [WF-PORTAL-004]):
 * `POST requests` responde 422 `PORTAL.INELIGIBLE { reason:
 * 'servico_com_rota_propria', alternative }` (§2.3 passo 4).
 */
export const OWN_ROUTE_BY_SERVICE: Readonly<Record<string, string>> = {
  manifestar: '/v1/portal/manifestations',
  avaliar: '/v1/portal/evaluations',
};
