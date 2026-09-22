import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'teat-device-handoff-form',
  standalone: true,
  template: `<form (submit)="submit($event)">
    <label>{{ label() }}<input name="deviceId" /></label
    ><button type="submit">{{ action() }}</button>
  </form>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceHandoffForm {
  readonly label = input.required<string>();
  readonly action = input.required<string>();
  readonly saved = output<string>();
  submit(event: Event): void {
    event.preventDefault();
    this.saved.emit(
      String(
        new FormData(event.target as HTMLFormElement).get('deviceId') ?? '',
      ),
    );
  }
}
