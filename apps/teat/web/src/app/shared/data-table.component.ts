import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'teat-data-table',
  standalone: true,
  template: `<table>
    <tbody></tbody>
  </table>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  readonly rows = input<readonly unknown[]>([]);
}
