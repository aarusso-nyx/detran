import { z } from 'zod';

const nonEmpty = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).optional();
const dateTime = z.string().datetime({ offset: true });
const role = z.enum([
  'condutor',
  'passageiro',
  'pedestre',
  'ciclista',
  'field-agent',
  'field-supervisor',
]);

export const crashStartSchema = z.object({
  crash_type: nonEmpty,
  severity: nonEmpty,
  shift: nonEmpty,
});

export const crashLocationSchema = z
  .object({
    occurred_at: dateTime,
    recorded_at: dateTime,
    location_mode: z.enum(['gps', 'manual']),
    gps_latitude: z.number().min(-90).max(90).optional(),
    gps_longitude: z.number().min(-180).max(180).optional(),
    gps_accuracy_m: z.number().nonnegative().optional(),
    uf: z.string().length(2),
    municipality: nonEmpty,
    road: optionalText,
    km: optionalText,
    direction: optionalText,
    reference: optionalText,
  })
  .refine(
    (value) => new Date(value.occurred_at) <= new Date(value.recorded_at),
    {
      message: 'occurred_at must not be after recorded_at',
      path: ['occurred_at'],
    },
  )
  .refine(
    (value) =>
      value.location_mode === 'manual' ||
      (value.gps_latitude !== undefined &&
        value.gps_longitude !== undefined &&
        value.gps_accuracy_m !== undefined),
    {
      message: 'GPS data is required for GPS location mode',
      path: ['location_mode'],
    },
  );

export const crashConditionsSchema = z.object({
  road_condition: nonEmpty,
  weather: nonEmpty,
  lighting: nonEmpty,
  signage: nonEmpty,
});

const vehicle = z.object({
  role: nonEmpty,
  sequence: z.number().int().positive(),
  plate: optionalText,
  snapshot_id: optionalText,
  apparent_damage: optionalText,
});
export const crashVehiclesSchema = z.object({ vehicles: z.array(vehicle) });

const person = z.object({
  role,
  person_id: optionalText,
  vehicle_sequence: z.number().int().positive().optional(),
  seat_belt_or_helmet: z.boolean().optional(),
  refusal_recorded: z.boolean().optional(),
  cpf: z
    .string()
    .regex(/^\d{11}$/)
    .optional(),
});
export const crashPeopleSchema = z.object({ people: z.array(person) });

export const crashVictimsSchema = z
  .object({
    person_id: nonEmpty,
    severity: nonEmpty,
    death_at_scene: z.boolean(),
    death_at: dateTime.optional(),
    medical_care: z.boolean(),
    destination_hospital: optionalText,
    health_notes: z.string().max(500).optional(),
    purpose: nonEmpty,
    audited: z.literal(true),
  })
  .superRefine((value, context) => {
    if (
      value.death_at !== undefined &&
      !value.death_at_scene &&
      !value.medical_care
    ) {
      context.addIssue({
        code: 'custom',
        path: ['death_at'],
        message: 'death_at requires scene death or care',
      });
    }
  });

export const crashDynamicsSchema = z.object({
  regime: z.enum(['176', '177', '178']),
  duties_176: z.array(nonEmpty).optional(),
  subject_177: optionalText,
  removal_178: z.boolean().optional(),
  driver_id: optionalText,
});

export const crashSketchSchema = z.object({
  sketch_type: z.enum(['drawing', 'attachment', 'georeferenced-map']),
  drawing_json: optionalText,
  attachment_id: optionalText,
  map_reference: optionalText,
});

export const crashEvidenceSchema = z.object({
  photos: z
    .array(
      z.object({
        hash: nonEmpty,
        mime_type: nonEmpty,
        scene_only: z.literal(true),
      }),
    )
    .min(1),
});

export const crashDamagesSchema = z.object({
  damages: z.array(
    z.object({
      asset_nature: nonEmpty,
      description: nonEmpty,
      road_equipment: z.boolean().optional(),
    }),
  ),
  witnesses: z.array(
    z.object({
      name: nonEmpty,
      contact: optionalText,
      refused: z.boolean(),
    }),
  ),
});

export const crashReviewSchema = z.object({
  minimum_data_complete: z.literal(true),
  vehicle_or_person_count: z.number().int().positive(),
  victims_complete_when_required: z.literal(true),
  content_hash: nonEmpty,
  idempotency_key: nonEmpty,
});

export const crashComplementSchema = z.object({
  missing_fields: z.array(nonEmpty).min(1),
});

export const renaestSchema = z
  .object({
    natural_key: nonEmpty,
    final_dynamics: z.literal(true),
    victims_complete_when_required: z.literal(true),
    action: z.enum(['close', 'transmit', 'complement', 'correct']),
    reason: optionalText,
    changed_fields: z.array(nonEmpty).optional(),
    idempotency_key: nonEmpty.optional(),
  })
  .superRefine((value, context) => {
    if (
      value.action === 'correct' &&
      (!value.reason || !value.changed_fields?.length)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['reason'],
        message: 'correction requires reason and changed fields',
      });
    }
    if (value.action === 'transmit' && !value.idempotency_key) {
      context.addIssue({
        code: 'custom',
        path: ['idempotency_key'],
        message: 'transmit requires idempotency key',
      });
    }
  });

export const subjectRequestSchema = z
  .object({
    request: z.enum(['access', 'correction', 'elimination']),
    purpose: nonEmpty,
    subject_id: nonEmpty,
    audited: z.literal(true),
    retention_block: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.request !== 'elimination' || value.retention_block !== true,
    {
      message: 'elimination is blocked while DT-049 applies',
      path: ['request'],
    },
  );

export type BoatFormSchema = typeof crashStartSchema;
