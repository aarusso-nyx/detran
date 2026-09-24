import { z } from 'zod';
export const measureTermSchema = z.object({
  caput_fields: z.array(z.string()).length(7),
  art14_1_fields: z.array(z.string()).length(4),
  withdrawal_deadlines: z.array(z.string()).length(2),
  signature_outcome: z.enum(['assinado', 'recusa', 'impossibilidade']),
});
