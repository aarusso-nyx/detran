import { z } from 'zod';
export const alcoholRefusalSchema = z.object({
  kind: z.enum(['recusa', 'impossibilidade']),
  descricao: z.string(),
  testemunha: z.string(),
  impossibilidade: z.never().optional(),
});
