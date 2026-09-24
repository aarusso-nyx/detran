import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'teat-proposed-value-field',
  standalone: true,
  template: `<label
    >{{ label() }}<input [value]="value()" (input)="update($event)"
  /></label>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProposedValueField {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly changed = output<string>();
  update(event: Event): void {
    this.changed.emit((event.target as HTMLInputElement).value);
  }
}
