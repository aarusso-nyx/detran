import { z } from 'zod';
export const aitEvidenceSchema = z.object({
  tipo: z.enum(['photo', 'video', 'audio', 'document']),
  hash: z.string().regex(/^[a-f0-9]{64}$/i),
});
