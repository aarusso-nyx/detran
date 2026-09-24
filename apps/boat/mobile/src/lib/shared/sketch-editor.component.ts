import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'boat-sketch-editor',
  standalone: true,
  template: '<canvas [attr.aria-label]="label()"></canvas>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SketchEditorComponent {
  readonly label = signal('boat.screens.crash_sketch.title');
}
