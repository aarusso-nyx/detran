/** In-memory data states for the explicit UI homologation entry. */
import { InjectionToken, signal } from '@angular/core';
import { Subject, type Observable } from 'rxjs';

export type TeatWebHomologationDataState = 'data' | 'empty' | 'error';

export interface TeatWebHomologationScenario {
  mode(): TeatWebHomologationDataState;
  setMode(mode: TeatWebHomologationDataState): void;
  refresh(): void;
  readonly updates: Observable<void>;
}

export const TEAT_WEB_HOMOLOGATION_SCENARIO =
  new InjectionToken<TeatWebHomologationScenario>(
    'TEAT_WEB_HOMOLOGATION_SCENARIO',
  );

export function createTeatWebHomologationScenario(): TeatWebHomologationScenario {
  const mode = signal<TeatWebHomologationDataState>('data');
  const refreshes = new Subject<void>();
  return {
    mode: mode.asReadonly(),
    setMode: (candidate) => {
      if (!['data', 'empty', 'error'].includes(candidate)) {
        throw new Error('web-homologation-scenario-invalid');
      }
      mode.set(candidate);
    },
    refresh: () => refreshes.next(),
    updates: refreshes.asObservable(),
  };
}
