import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'teat-closed-enum-picker',
  standalone: true,
  template: `<label
    >{{ label()
    }}<select [value]="value()" (change)="choose($event)">
      @for (option of options(); track option) {
        <option [value]="option">{{ option }}</option>
      }
    </select></label
  >`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClosedEnumPicker {
  readonly label = input.required<string>();
  readonly options = input.required<readonly string[]>();
  readonly value = input.required<string>();
  readonly changed = output<string>();
  choose(event: Event): void {
    this.changed.emit((event.target as HTMLSelectElement).value);
  }
}
