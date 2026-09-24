/** In-memory lifecycle for inspectable pre-shift and operational UI scenarios. */
import { InjectionToken, signal, type Signal } from '@angular/core';

export type HomologationShiftPhase = 'pre-shift' | 'open';

export interface HomologationShiftPort {
  readonly phase: Signal<HomologationShiftPhase>;
  beginPreShift(): void;
  openShift(): void;
}

export const TEAT_MOBILE_HOMOLOGATION_SHIFT =
  new InjectionToken<HomologationShiftPort>('TEAT_MOBILE_HOMOLOGATION_SHIFT');

export function createTeatMobileHomologationShift(): HomologationShiftPort {
  const phase = signal<HomologationShiftPhase>('open');
  return {
    phase: phase.asReadonly(),
    beginPreShift: () => phase.set('pre-shift'),
    openShift: () => {
      if (phase() !== 'pre-shift') throw new Error('demo-shift-not-prepared');
      phase.set('open');
    },
  };
}
