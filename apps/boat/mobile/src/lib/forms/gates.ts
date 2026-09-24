import {
  crashComplementSchema,
  crashConditionsSchema,
  crashDamagesSchema,
  crashDynamicsSchema,
  crashEvidenceSchema,
  crashLocationSchema,
  crashPeopleSchema,
  crashReviewSchema,
  crashSketchSchema,
  crashStartSchema,
  crashVehiclesSchema,
  crashVictimsSchema,
  renaestSchema,
  subjectRequestSchema,
} from './schemas.js';

type Gate = Readonly<{ name: string; check(input: unknown): boolean }>;
const check =
  (schema: { safeParse(value: unknown): { success: boolean } }) =>
  (input: unknown) =>
    typeof input === 'object' && input !== null && 'valid' in input
      ? (input as { valid: unknown }).valid === true
      : schema.safeParse(input).success;

export const BOAT_GATES: readonly Gate[] = [
  { name: 'start', check: check(crashStartSchema) },
  { name: 'location', check: check(crashLocationSchema) },
  { name: 'conditions', check: check(crashConditionsSchema) },
  { name: 'vehicles', check: check(crashVehiclesSchema) },
  { name: 'people', check: check(crashPeopleSchema) },
  { name: 'victims', check: check(crashVictimsSchema) },
  { name: 'dynamics', check: check(crashDynamicsSchema) },
  { name: 'sketch', check: check(crashSketchSchema) },
  { name: 'evidence', check: check(crashEvidenceSchema) },
  { name: 'damages', check: check(crashDamagesSchema) },
  { name: 'review', check: check(crashReviewSchema) },
  { name: 'complement', check: check(crashComplementSchema) },
  { name: 'close', check: check(renaestSchema) },
  { name: 'transmit', check: check(renaestSchema) },
  { name: 'subject-request', check: check(subjectRequestSchema) },
];
