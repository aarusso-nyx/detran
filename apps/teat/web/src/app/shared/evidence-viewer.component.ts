import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'teat-evidence-viewer',
  standalone: true,
  template: `<section><ng-content /></section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvidenceViewerComponent {
  readonly evidence = input<unknown>();
}
