import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { AuthBootstrapCoordinator } from '../../../core/bootstrap.store.js';
import { TeatI18n } from '../../../core/i18n.service.js';
import { dispatchTransition } from '../../../navigation/transitions.js';
import { TEAT_MOBILE_HOMOLOGATION_PERSONA } from '../../../shared/homologation-persona.port.js';
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
      @if (homologationPersona) {
        <form data-homologation-mfa (submit)="validateDemoCode($event)">
          <label>
            {{ demoCodeLabel }}
            <input
              name="demo_code"
              inputmode="numeric"
              autocomplete="one-time-code"
            />
          </label>
          <button type="submit">{{ demoValidateLabel }}</button>
          @if (demoError()) {
            <p role="alert">{{ demoError() }}</p>
          }
        </form>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthMfaPageComponent implements OnInit {
  private readonly i18n = inject(TeatI18n);
  private readonly runtime = inject(MobilePageRuntime);
  private readonly session = inject(StynxSessionService);
  private readonly coordinator = inject(AuthBootstrapCoordinator);
  private readonly router = inject(Router);
  readonly homologationPersona = inject(TEAT_MOBILE_HOMOLOGATION_PERSONA, {
    optional: true,
  });
  private readonly homologationShift = inject(TEAT_MOBILE_HOMOLOGATION_SHIFT, {
    optional: true,
  });
  readonly demoError = signal('');
  readonly demoCodeLabel = this.i18n.translate(
    'teat.forms.homologationMfa.code',
  );
  readonly demoValidateLabel = this.i18n.translate(
    'teat.forms.homologationMfa.validate',
  );
  readonly screenId = 'auth-mfa';
  readonly contract = mobilePageContract(this.screenId);
  readonly schema = this.contract.schemaId;
  readonly client = this.contract.clientId;
  readonly load = () => this.runtime.load(this.contract);
  readonly integration = this.load();
  readonly completeLogin = async (): Promise<void> => {
    let target: string;
    try {
      await this.session.completeLogin(window.location.href);
      const state = await this.coordinator.start();
      target =
        state.status === 'ready'
          ? !('bootstrap' in state) ||
            state.bootstrap.context.activeShift?.status === 'open'
            ? '/home'
            : '/shift-context'
          : '/device-blocked';
    } catch {
      target = '/device-blocked';
    }
    await this.router.navigateByUrl(target).catch(() => false);
  };
  readonly title = this.i18n.translate('teat.shell.mobile');
  readonly status = this.i18n.translate('teat.common.loading');

  ngOnInit(): void {
    if (this.homologationPersona === null) void this.completeLogin();
  }

  async validateDemoCode(event: Event): Promise<void> {
    event.preventDefault();
    if (this.homologationPersona === null) return;
    const form = event.target as HTMLFormElement;
    const code = (
      form.elements.namedItem('demo_code') as HTMLInputElement | null
    )?.value;
    if (code !== '000000') {
      this.demoError.set(
        this.i18n.translate('teat.forms.homologationMfa.invalid'),
      );
      return;
    }
    if (this.homologationShift === null) {
      this.demoError.set(
        this.i18n.translate('teat.navigation.homologationDenied'),
      );
      return;
    }
    this.demoError.set('');
    this.homologationShift.beginPreShift();
    const result = await dispatchTransition(
      { from: 'auth-mfa', action: 'Validar código', conditionSatisfied: true },
      this.router,
      { back: () => undefined },
    );
    if (result.kind === 'denied')
      this.demoError.set(
        this.i18n.translate('teat.navigation.homologationDenied'),
      );
  }
}
