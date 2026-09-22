import { z } from 'zod';
export const aitVehicleSchema = z.object({
  placa: z.string().regex(/^[A-Z]{3}(?:[0-9]{4}|[0-9][A-Z][0-9]{2})$/),
  visually_confirmed_by_agent: z.boolean(),
  divergencia: z.boolean(),
});
