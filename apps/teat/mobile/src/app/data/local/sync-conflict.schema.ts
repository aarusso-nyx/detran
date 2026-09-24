import { z } from 'zod';
export const syncConflictSchema = z.object({
  action: z.enum([
    'manual_review',
    'accept_server',
    'reject',
    'retry_after_correction',
  ]),
  description: z.string(),
});
