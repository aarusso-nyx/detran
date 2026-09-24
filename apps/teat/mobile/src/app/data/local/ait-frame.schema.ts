import { z } from 'zod';
export const aitFrameSchema = z
  .object({
    enquadramento: z.string(),
    approach_class: z.string(),
    required_fields: z.array(z.string()),
    requires_equipment: z.boolean(),
    equipment_id: z.string().min(1).optional(),
    justificativa: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.approach_class === 'caso_3' && !value.justificativa)
      context.addIssue({ code: 'custom', message: 'required' });
    if (value.approach_class !== 'caso_3' && value.justificativa !== undefined)
      context.addIssue({ code: 'custom', message: 'forbidden' });
    if (value.requires_equipment && !value.equipment_id)
      context.addIssue({ code: 'custom', message: 'equipment_required' });
  });
