import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'teat-paired-value',
  standalone: true,
  template: `<dl>
    <dt>{{ label() }}</dt>
    <dd>{{ original() }}</dd>
    <dd>{{ proposed() }}</dd>
  </dl>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PairedValue {
  readonly label = input.required<string>();
  readonly original = input.required<string>();
  readonly proposed = input.required<string>();
}
