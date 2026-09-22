import { z } from 'zod';
export const aitReviewSchema = z.object({
  blocking_validations_green: z.literal(true),
  reserved_number: z.string(),
  package_valid: z.literal(true),
  explicit_action: z.literal('finalize'),
});
