import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'teat-freshness-badge',
  standalone: true,
  template: `<time [attr.datetime]="timestamp()">{{ timestamp() }}</time>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FreshnessBadgeComponent {
  readonly timestamp = input('');
}
