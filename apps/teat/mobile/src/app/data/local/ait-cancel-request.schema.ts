import { z } from 'zod';
export const aitCancelRequestSchema = z.object({
  justificativa: z.string(),
  destinatario: z.enum(['traffic-authority', 'diretoria-fiscalizacao']),
  base_legal: z.string(),
  origin_status: z.string(),
});
