import { InjectionToken } from '@angular/core';
import { aitVehicleSchema } from '../data/local/ait-vehicle.schema.js';
import { aitDriverSchema } from '../data/local/ait-driver.schema.js';
import { aitFrameSchema } from '../data/local/ait-frame.schema.js';
import { aitLocationSchema } from '../data/local/ait-location.schema.js';
import { aitEvidenceSchema } from '../data/local/ait-evidence.schema.js';
import { aitSignatureSchema } from '../data/local/ait-signature.schema.js';
import { aitReviewSchema } from '../data/local/ait-review.schema.js';
import type { MobileCommandContext } from './mobile-page.component.js';

export const HOMOLOGATION_AIT_STEPS = [
  'ait-start',
  'ait-vehicle',
  'ait-driver',
  'ait-frame',
  'ait-frame-detail',
  'ait-location',
  'ait-notes',
  'ait-validations',
  'ait-evidence',
  'ait-measures',
  'ait-signature',
  'ait-review',
] as const;

export interface HomologationAitOutcome {
  readonly kind: 'demonstrated';
  readonly localEntityId: string;
}

export interface HomologationAitSnapshot {
  readonly localEntityId: string;
  readonly plate: string;
  readonly scenarioHash: string;
  readonly completedSteps: readonly string[];
}

export interface HomologationAitPort {
  readonly profile: 'homologation';
  start(
    input?: unknown,
    context?: MobileCommandContext,
  ): Promise<HomologationAitOutcome>;
  saveStep?(screenId: string, input: unknown): Promise<HomologationAitOutcome>;
  review(
    input?: unknown,
    context?: MobileCommandContext,
  ): Promise<HomologationAitOutcome>;
  snapshot?(): HomologationAitSnapshot;
}

/** Absent in the common bootstrap. Only an explicit homologation composition provides it. */
export const TEAT_HOMOLOGATION_AIT = new InjectionToken<HomologationAitPort>(
  'TEAT_HOMOLOGATION_AIT',
);

function scenarioDigest(value: string): string {
  // A deterministic display fingerprint, never an official evidence hash.
  let state = 2166136261;
  for (const char of value)
    state = Math.imul(state ^ char.charCodeAt(0), 16777619) >>> 0;
  return Array.from({ length: 8 }, (_, index) => {
    state = Math.imul(state ^ (index + 1), 16777619) >>> 0;
    return state.toString(16).padStart(8, '0');
  }).join('');
}

function validStep(screenId: string, input: unknown): unknown {
  switch (screenId) {
    case 'ait-vehicle': {
      const vehicle = aitVehicleSchema.parse(input);
      if (!vehicle.visually_confirmed_by_agent)
        throw new Error('visual-confirmation-required');
      return vehicle;
    }
    case 'ait-driver':
      return aitDriverSchema.parse(input);
    case 'ait-frame': {
      const frame = aitFrameSchema.parse(input);
      if (
        frame.enquadramento.trim().length === 0 ||
        frame.approach_class.trim().length === 0
      ) {
        throw new Error('frame-selection-required');
      }
      return frame;
    }
    case 'ait-location': {
      const location = aitLocationSchema.parse(input);
      if (
        [location.local, location.uf, location.municipio].some(
          (value) => value.trim().length === 0,
        ) ||
        !Number.isFinite(location.gps_accuracy_m) ||
        location.gps_accuracy_m < 0
      ) {
        throw new Error('location-required');
      }
      return location;
    }
    case 'ait-evidence':
      return aitEvidenceSchema.parse(input);
    case 'ait-signature':
      return aitSignatureSchema.parse(input);
    case 'ait-frame-detail':
    case 'ait-notes':
    case 'ait-validations':
    case 'ait-measures':
      if ((input as { confirm?: unknown } | null)?.confirm !== true)
        throw new Error('confirmation-required');
      return { confirm: true };
    default:
      throw new Error('unknown-homologation-step');
  }
}

/** Memory-only synthetic scenario. No official store, numbering, queue, print or endpoint. */
export function createHomologationAitScenario(): HomologationAitPort {
  const localEntityId = 'demo-ait-001';
  const values = new Map<string, unknown>();
  let nextStep = 0;
  const snapshot = (): HomologationAitSnapshot => ({
    localEntityId,
    plate: String(
      (values.get('ait-vehicle') as { placa?: string } | undefined)?.placa ??
        '',
    ),
    scenarioHash: scenarioDigest(JSON.stringify([...values])),
    completedSteps: [...values.keys()],
  });
  return {
    profile: 'homologation',
    start: async (input) => {
      if (
        nextStep !== 0 ||
        (input as { approach?: unknown } | null)?.approach !== 'with-approach'
      ) {
        throw new Error('homologation-start-invalid');
      }
      values.set('ait-start', { approach: 'with-approach' });
      nextStep = 1;
      return { kind: 'demonstrated', localEntityId };
    },
    saveStep: async (screenId, input) => {
      if (
        HOMOLOGATION_AIT_STEPS[nextStep] !== screenId ||
        screenId === 'ait-review'
      ) {
        throw new Error('homologation-step-out-of-order');
      }
      values.set(screenId, validStep(screenId, input));
      nextStep += 1;
      return { kind: 'demonstrated', localEntityId };
    },
    review: async (input) => {
      if (nextStep !== HOMOLOGATION_AIT_STEPS.length - 1)
        throw new Error('homologation-draft-incomplete');
      const requested = input as { explicit_action?: unknown } | null;
      aitReviewSchema.parse({
        validation_blockers: [],
        reserved_number: localEntityId,
        explicit_action: requested?.explicit_action,
      });
      values.set('ait-review', { explicit_action: 'finalize' });
      nextStep += 1;
      return { kind: 'demonstrated', localEntityId };
    },
    snapshot,
  };
}
