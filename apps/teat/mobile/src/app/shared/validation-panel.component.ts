import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'teat-validation-panel',
  standalone: true,
  template: `<section [attr.aria-label]="label()">
    <ul>
      @for (message of messages(); track message) {
        <li>{{ message }}</li>
      }
    </ul>
  </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationPanel {
  readonly label = input.required<string>();
  readonly messages = input.required<readonly string[]>();
}
