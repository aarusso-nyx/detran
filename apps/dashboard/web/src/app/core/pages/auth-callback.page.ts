// `/monitoramento/auth/callback` (CTG-0002.md §3): retorno OIDC. Com `code` e `state` na query,
// conclui a sessão STYNX e vai para a raiz do console; sem eles, inicia o login. Enquanto
// aguarda, estado "carregando"; falha vira banner classificado — nunca tela vazia. O deep-link
// pedido antes do login não é preservado (precedente OD-R12-006).
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
import { DashErrorBannerComponent } from '../error-banner.component';
import { classifyError, type ClassifiedError } from '../error-boundary';

const HOME_ROUTE = '/monitoramento';

@Component({
  selector: 'dash-auth-callback-page',
  imports: [
    DashErrorBannerComponent,
    DetranLoadingStateComponent,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-screen': '' },
  template: `
    <h1>{{ 'dashboard.shell.title.auth_callback' | stynxTranslate }}</h1>
    @if (failure(); as error) {
      <dash-error-banner [error]="error" />
    } @else {
      <detran-loading-state
        [label]="'dashboard.states.loading' | stynxTranslate"
      />
    }
  `,
})
export class AuthCallbackPageComponent implements OnInit {
  private readonly session = inject(StynxSessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  protected readonly failure = signal<ClassifiedError | null>(null);

  async ngOnInit(): Promise<void> {
    const params = this.route.snapshot.queryParamMap;
    if (!params.has('code') || !params.has('state')) {
      this.session.login();
      return;
    }
    try {
      await this.session.completeLogin(this.document.location?.href ?? '');
      await this.router.navigateByUrl(HOME_ROUTE);
    } catch (error: unknown) {
      this.failure.set(classifyError(error));
    }
  }
}
