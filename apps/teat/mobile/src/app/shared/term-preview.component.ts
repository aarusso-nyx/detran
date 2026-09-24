import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'teat-term-preview',
  standalone: true,
  template: `<article [attr.aria-label]="label()">
    <pre>{{ content() }}</pre>
  </article>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermPreview {
  readonly label = input.required<string>();
  readonly content = input.required<string>();
}
