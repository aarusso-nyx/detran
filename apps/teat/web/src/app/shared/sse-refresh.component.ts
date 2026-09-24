import { ChangeDetectionStrategy, Component, output } from '@angular/core';

import { TeatTranslatePipe } from './teat-translate.pipe.js';

@Component({
  selector: 'teat-sse-refresh',
  standalone: true,
  imports: [TeatTranslatePipe],
  template: `
    <button type="button" (click)="refresh.emit()">
      {{ 'teat.sync.resend' | teatTranslate }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SseRefreshComponent {
  readonly refresh = output<void>();
}
