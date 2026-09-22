import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'teat-queue-item-card',
  standalone: true,
  template: `<article>
    <h2>{{ title() }}</h2>
    <p role="status">{{ status() }}</p>
  </article>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueueItemCard {
  readonly title = input.required<string>();
  readonly status = input.required<string>();
}
