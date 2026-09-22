import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BodycamState = 'recording' | 'paused-exception' | 'failure';

@Component({
  selector: 'teat-bodycam-indicator',
  standalone: true,
  template: '<span role="status">{{ state() }}</span>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodycamIndicator {
  readonly state = input.required<BodycamState>();
}
