import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'teat-location-field',
  standalone: true,
  template: `<output [attr.aria-label]="label()"
    >{{ latitude() }},{{ longitude() }}</output
  >`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationField {
  readonly label = input.required<string>();
  readonly latitude = input.required<number>();
  readonly longitude = input.required<number>();
}
