import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'teat-signature-capture',
  standalone: true,
  template: `<button
    type="button"
    [attr.aria-label]="label()"
    (click)="requested.emit()"
  >
    {{ label() }}
  </button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignatureCapture {
  readonly label = input.required<string>();
  readonly requested = output<void>();
}
