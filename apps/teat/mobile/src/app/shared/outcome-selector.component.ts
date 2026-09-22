import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'teat-outcome-selector',
  standalone: true,
  template: `<fieldset>
    <legend>{{ legend() }}</legend>
    @for (outcome of outcomes(); track outcome) {
      <button type="button" (click)="selected.emit(outcome)">
        {{ outcome }}
      </button>
    }
  </fieldset>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutcomeSelector {
  readonly legend = input.required<string>();
  readonly outcomes = input.required<readonly string[]>();
  readonly selected = output<string>();
}
