import {
  ChangeDetectionStrategy,
  Component,
  inject,
  InjectionToken,
  input,
  signal,
  type Signal,
} from '@angular/core';
import { TeatErrorBoundaryState } from './field-shell.component.js';

export type BodycamState = 'recording' | 'paused-exception' | 'failure';

export interface BodycamStatePort {
  readonly state: Signal<BodycamState>;
}

export const TEAT_BODYCAM_STATE = new InjectionToken<BodycamStatePort>(
  'TEAT_BODYCAM_STATE',
  {
    providedIn: 'root',
    factory: () => {
      inject(TeatErrorBoundaryState).capture(
        { code: 'TEAT.BODYCAM_UNAVAILABLE' },
        'action',
      );
      return { state: signal<BodycamState>('failure') };
    },
  },
);

@Component({
  selector: 'teat-bodycam-indicator',
  standalone: true,
  template: '<span role="status">{{ state() }}</span>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodycamIndicator {
  readonly state = input.required<BodycamState>();
}
