/** UI-only persona switch. Never persisted or installed in the common entry. */
import { InjectionToken, signal, type Signal } from '@angular/core';
import type { DetranRole } from '../core/bootstrap.store.js';

export const TEAT_MOBILE_HOMOLOGATION_ROLES: readonly DetranRole[] = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'auditor',
  'bi-analyst',
  'integration-operator',
];

export interface MobileHomologationPersona {
  readonly role: Signal<DetranRole>;
  setRole(role: string): void;
}

export const TEAT_MOBILE_HOMOLOGATION_PERSONA =
  new InjectionToken<MobileHomologationPersona>(
    'TEAT_MOBILE_HOMOLOGATION_PERSONA',
  );

export function createTeatMobileHomologationPersona(): MobileHomologationPersona {
  const role = signal<DetranRole>('field-agent');
  return {
    role: role.asReadonly(),
    setRole: (candidate) => {
      if (!TEAT_MOBILE_HOMOLOGATION_ROLES.includes(candidate as DetranRole))
        throw new Error('homologation-persona-invalid');
      role.set(candidate as DetranRole);
    },
  };
}
