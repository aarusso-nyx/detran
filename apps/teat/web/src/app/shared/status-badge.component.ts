import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TeatTranslatePipe } from './teat-translate.pipe.js';

@Component({
  selector: 'teat-status-badge',
  standalone: true,
  imports: [TeatTranslatePipe],
  template: `<span>{{ labelKey() | teatTranslate }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly labelKey = input('teat.sync.pending');
}
