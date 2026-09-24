import { z } from 'zod';
export const openShiftSchema = z.object({
  unidade: z.string(),
  equipe: z.string(),
  viatura: z.string(),
  localizacao: z.string(),
});
