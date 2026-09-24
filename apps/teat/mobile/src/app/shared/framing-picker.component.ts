import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'teat-framing-picker',
  standalone: true,
  template: `<fieldset>
    <legend>{{ legend() }}</legend>
    @for (frame of frames(); track frame) {
      <button type="button" (click)="selected.emit(frame)">{{ frame }}</button>
    }
  </fieldset>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FramingPicker {
  readonly legend = input.required<string>();
  readonly frames = input.required<readonly string[]>();
  readonly selected = output<string>();
}
