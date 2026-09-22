import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TeatI18n } from '../../../core/i18n.service.js';
import {
  mobilePageContract,
  MobilePageRuntime,
} from '../../../shared/mobile-page.component.js';

@Component({
  standalone: true,
  template: `
    <main [attr.data-screen]="screenId">
      <h1>{{ title }}</h1>
      <p role="status">{{ status }}</p>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleResultPageComponent {
  private readonly i18n = inject(TeatI18n);
  private readonly runtime = inject(MobilePageRuntime);
  readonly screenId = 'vehicle-result';
  readonly contract = mobilePageContract(this.screenId);
  readonly schema = this.contract.schemaId;
  readonly client = this.contract.clientId;
  readonly load = () => this.runtime.load(this.contract);
  readonly integration = this.load();
  readonly title = this.i18n.translate('teat.shell.mobile');
  readonly status = this.i18n.translate('teat.common.loading');
}
