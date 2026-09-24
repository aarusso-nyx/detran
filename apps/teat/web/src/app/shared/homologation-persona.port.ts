/** UI-only persona switch. Never persisted or installed in the common entry. */
import { InjectionToken, signal, type Signal } from '@angular/core';
import { TEAT_WEB_ROLES, type TeatWebRole } from '../core/roles.js';

export interface WebHomologationPersona {
  readonly role: Signal<TeatWebRole>;
  setRole(role: string): void;
}

export const TEAT_WEB_HOMOLOGATION_PERSONA =
  new InjectionToken<WebHomologationPersona>('TEAT_WEB_HOMOLOGATION_PERSONA');

export function createTeatWebHomologationPersona(): WebHomologationPersona {
  const role = signal<TeatWebRole>('processing-operator');
  return {
    role: role.asReadonly(),
    setRole: (candidate) => {
      if (!(TEAT_WEB_ROLES as readonly string[]).includes(candidate))
        throw new Error('homologation-persona-invalid');
      role.set(candidate as TeatWebRole);
    },
  };
}
