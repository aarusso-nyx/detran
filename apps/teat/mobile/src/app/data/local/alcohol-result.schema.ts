import { z } from 'zod';
export const alcoholResultSchema = z
  .object({
    medido: z.number().nonnegative(),
    considerado: z.number().nonnegative(),
    horario: z.string().datetime({ offset: true }),
  })
  .superRefine((value, context) => {
    const expected = Math.max(0, Number((value.medido - 0.01).toFixed(2)));
    if (value.considerado !== expected) {
      context.addIssue({ code: 'custom', message: 'derived_value_mismatch' });
    }
  });
