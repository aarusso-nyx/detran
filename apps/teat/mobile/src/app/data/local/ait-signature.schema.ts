import { z } from 'zod';
export const aitSignatureSchema = z.discriminatedUnion('resultado', [
  z.object({ resultado: z.literal('assinado') }),
  z.object({ resultado: z.literal('recusa'), motivo: z.string().min(1) }),
  z.object({
    resultado: z.literal('impossibilidade'),
    motivo: z.string().min(1),
  }),
]);
