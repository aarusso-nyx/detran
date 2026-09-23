import { z } from 'zod';
export const aitReviewSchema = z.object({
  validation_blockers: z.array(z.string()).max(0),
  reserved_number: z.string(),
  explicit_action: z.literal('finalize'),
});
