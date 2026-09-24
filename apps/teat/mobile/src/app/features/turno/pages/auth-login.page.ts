import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { TeatI18n } from '../../../core/i18n.service.js';
import { dispatchTransition } from '../../../navigation/transitions.js';
import { TEAT_MOBILE_HOMOLOGATION_SHIFT } from '../../../shared/homologation-shift.port.js';
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
      @if (homologationShift) {
        <form data-homologation-login (submit)="loginDemo($event)">
          <label
            >{{ demoIdentityLabel
            }}<input name="demo_identity" autocomplete="off"
          /></label>
          <label
            >{{ demoCredentialLabel
            }}<input name="demo_credential" type="password" autocomplete="off"
          /></label>
          <button type="submit">{{ demoLoginLabel }}</button>
          @if (demoError()) {
            <p role="alert">{{ demoError() }}</p>
          }
        </form>
      } @else {
        <button type="button" (click)="login()">{{ loginLabel }}</button>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLoginPageComponent {
  private readonly i18n = inject(TeatI18n);
  private readonly runtime = inject(MobilePageRuntime);
  private readonly session = inject(StynxSessionService);
  private readonly router = inject(Router);
  readonly homologationShift = inject(TEAT_MOBILE_HOMOLOGATION_SHIFT, {
    optional: true,
  });
  readonly demoError = signal('');
  readonly screenId = 'auth-login';
  readonly contract = mobilePageContract(this.screenId);
  readonly schema = this.contract.schemaId;
  readonly client = this.contract.clientId;
  readonly load = () => this.runtime.load(this.contract);
  readonly integration = this.load();
  readonly login = () => this.session.login();
  readonly title = this.i18n.translate('teat.shell.mobile');
  readonly status = this.i18n.translate('teat.common.loading');
  readonly loginLabel = this.i18n.translate('teat.common.confirm');
  readonly demoIdentityLabel = this.i18n.translate(
    'teat.forms.homologationLogin.identity',
  );
  readonly demoCredentialLabel = this.i18n.translate(
    'teat.forms.homologationLogin.credential',
  );
  readonly demoLoginLabel = this.i18n.translate(
    'teat.forms.homologationLogin.submit',
  );

  async loginDemo(event: Event): Promise<void> {
    event.preventDefault();
    if (this.homologationShift === null) return;
    const form = event.target as HTMLFormElement;
    const identity = (
      form.elements.namedItem('demo_identity') as HTMLInputElement | null
    )?.value;
    const credential = (
      form.elements.namedItem('demo_credential') as HTMLInputElement | null
    )?.value;
    if (identity !== 'demo-agent' || credential !== 'demo-only') {
      this.demoError.set(
        this.i18n.translate('teat.forms.homologationLogin.invalid'),
      );
      return;
    }
    this.demoError.set('');
    const result = await dispatchTransition(
      {
        from: 'auth-login',
        action: 'Entrar',
        conditionSatisfied: true,
        transitionIndex: 129,
      },
      this.router,
      { back: () => undefined },
    );
    if (result.kind === 'denied')
      this.demoError.set(
        this.i18n.translate('teat.navigation.homologationDenied'),
      );
  }
}
