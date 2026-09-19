// Manifestação à ouvidoria (contrato CTG-0003a §6.2; contrato de rotas §8). O comando é do
// par 3, que confere contra `BpPortalCitizenService001Commands`.
import { z } from 'zod';
import type { FormGate } from './form-gate';

export const ManifestacaoSchema = z.strictObject({
  kind: z.enum(['reclamacao', 'denuncia', 'sugestao', 'elogio', 'solicitacao']),
  text: z.string().min(1),
  confidential: z.boolean().optional(),
  attachmentIds: z.array(z.uuid()),
  anonymous: z.boolean().optional(),
});

export type ManifestacaoBody = z.infer<typeof ManifestacaoSchema>;

export const MANIFESTACAO_GATE: FormGate = {
  serviceKey: 'manifestar',
  actKey: 'manifestar',
  minimumAssurance: 'none',
  precondition: {
    state: null,
    timer: null,
    note: 'sem motivo determinante; anônimo admitido',
    violation: null,
    warning: null,
  },
  command: 'manifest',
  effect:
    'MANIFESTACAO_REGISTRADA → comprovante imediato { protocol, receivedAt }',
};
