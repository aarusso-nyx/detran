import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'teat-dashboard-panel',
  standalone: true,
  template: `<section><ng-content /></section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPanelComponent {
  readonly model = input<unknown>();
}
