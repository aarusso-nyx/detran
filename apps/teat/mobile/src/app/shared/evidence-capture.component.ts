import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'teat-evidence-capture',
  standalone: true,
  template: `<label
    >{{ label() }}<input type="file" (change)="capture($event)"
  /></label>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvidenceCapture {
  readonly label = input.required<string>();
  readonly captured = output<File>();
  capture(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.captured.emit(file);
  }
}
