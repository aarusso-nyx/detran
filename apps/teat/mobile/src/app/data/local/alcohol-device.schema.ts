import { z } from 'zod';
export const alcoholDeviceSchema = z.object({
  breathalyzer_id: z.string(),
  verification_valid: z.literal(true),
});
