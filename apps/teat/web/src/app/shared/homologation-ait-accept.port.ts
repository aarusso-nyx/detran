/** Demonstrates the decision gesture without issuing a legal AIT command. */
import { InjectionToken } from '@angular/core';

export interface TeatWebHomologationAitAccept {
  accept(input: Readonly<{ id: string; version: number }>): Readonly<{
    kind: 'demonstrated';
    localEntityId: string;
  }>;
}

export const TEAT_WEB_HOMOLOGATION_AIT_ACCEPT =
  new InjectionToken<TeatWebHomologationAitAccept>(
    'TEAT_WEB_HOMOLOGATION_AIT_ACCEPT',
  );

export function createTeatWebHomologationAitAccept(): TeatWebHomologationAitAccept {
  return {
    accept: ({ id }) => ({ kind: 'demonstrated', localEntityId: id }),
  };
}
