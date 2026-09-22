import { z } from 'zod';
export const aitLocationSchema = z.object({
  local: z.string(),
  uf: z.string(),
  municipio: z.string(),
  gps_accuracy_m: z.number(),
  manual_edition: z.boolean(),
});
