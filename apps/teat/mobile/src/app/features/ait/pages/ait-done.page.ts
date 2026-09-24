import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TeatI18n } from '../../../core/i18n.service.js';
import { TEAT_HOMOLOGATION_AIT } from '../../../shared/homologation-ait.port.js';
import {
  mobilePageContract,
  MobilePageRuntime,
} from '../../../shared/mobile-page.component.js';

@Component({
  standalone: true,
  template: `
    <main
      [attr.data-screen]="screenId"
      [attr.data-state]="demonstrated ? 'demonstrated' : 'blocked'"
    >
      <h1>{{ title }}</h1>
      @if (demonstrated) {
        <p role="status">{{ demonstratedNotice }}</p>
        <p>
          {{ labels['teat.forms.homologationAit.syntheticId'] }}
          {{ snapshot?.localEntityId }}
        </p>
        <p>
          {{ labels['teat.forms.homologationAit.scenarioPlate'] }}
          {{ snapshot?.plate }}
        </p>
      } @else {
        <p role="status">{{ status }}</p>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AitDonePageComponent {
  readonly labels = new Proxy({} as Readonly<Record<string, string>>, {
    get: (_target, key) => this.i18n.translate(String(key)),
  });
  private readonly i18n = inject(TeatI18n);
  private readonly runtime = inject(MobilePageRuntime);
  private readonly homologationPort = inject(TEAT_HOMOLOGATION_AIT, {
    optional: true,
  });
  readonly screenId = 'ait-done';
  readonly contract = mobilePageContract(this.screenId);
  readonly schema = this.contract.schemaId;
  readonly client = this.contract.clientId;
  readonly load = () => this.runtime.load(this.contract);
  readonly integration = this.load();
  readonly title = this.i18n.translate('teat.shell.mobile');
  readonly snapshot = this.homologationPort?.snapshot?.();
  readonly demonstrated =
    this.homologationPort?.profile === 'homologation' &&
    this.snapshot?.completedSteps.includes('ait-review') === true;
  readonly demonstratedNotice = this.i18n.translate('teat.states.demonstrated');
  readonly status = this.i18n.translate('teat.readiness.blocker');
}
