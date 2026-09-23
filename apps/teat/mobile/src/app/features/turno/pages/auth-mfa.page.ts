import {
  ChangeDetectionStrategy,
  Component,
  inject,
  type OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { AuthBootstrapCoordinator } from '../../../core/bootstrap.store.js';
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
export class AuthMfaPageComponent implements OnInit {
  private readonly i18n = inject(TeatI18n);
  private readonly runtime = inject(MobilePageRuntime);
  private readonly session = inject(StynxSessionService);
  private readonly coordinator = inject(AuthBootstrapCoordinator);
  private readonly router = inject(Router);
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
    void this.completeLogin();
  }
}
