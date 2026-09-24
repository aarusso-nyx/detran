import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'teat-audit-timeline',
  standalone: true,
  template: `<ol></ol>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditTimelineComponent {
  readonly events = input<readonly unknown[]>([]);
}
