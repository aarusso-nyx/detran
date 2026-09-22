// `/auth/callback` (A2; OD-R12-006; contrato CTG-0002a §4; padrão do Portal): alvo de
// `loginRedirectRoute`. Com resposta OIDC na query (`code` e `state`) conclui a sessão
// (`StynxSessionService.completeLogin`) e navega a `/` (RoleHomeRedirect); sem resposta inicia
// o OIDC (`login()`); falha em `completeLogin` → `ErrorBoundary` + `rait.states.error` (com
// `requestId` quando houver). O deep-link pedido antes do login não é preservado (OD-R12-006).
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Injector,
  type OnInit,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
import { classifyError, type ClassifiedError } from '../error-boundary';
import { RaitErrorBannerComponent } from '../error-banner.component';
import { RaitSessionFacade } from '../session.facade';

const TITLE_KEY = 'rait.screens.auth-callback.title';
const LOADING_KEY = 'rait.states.loading';
const ERROR_KEY = 'rait.states.error';
const BACK_KEY = 'rait.common.back';
const CODE_PARAM = 'code';
const STATE_PARAM = 'state';
const HOME = '/';

@Component({
  selector: 'rait-auth-callback-page',
  imports: [
    RouterLink,
    DetranLoadingStateComponent,
    RaitErrorBannerComponent,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-screen': '' },
  template: `
    <h1>{{ titleKey | stynxTranslate }}</h1>
    @if (error(); as failure) {
      <rait-error-banner [error]="failure" />
      <p>
        <a routerLink="/">{{ backKey | stynxTranslate }}</a>
      </p>
    } @else {
      <detran-loading-state [label]="loadingKey | stynxTranslate" />
    }
  `,
})
export class AuthCallbackPageComponent implements OnInit {
  private readonly injector = inject(Injector);
  private readonly session = inject(RaitSessionFacade);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  readonly titleKey = TITLE_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly backKey = BACK_KEY;
  readonly error = signal<ClassifiedError | null>(null);

  async ngOnInit(): Promise<void> {
    const url = this.document.location?.href ?? '';
    const query = new URL(url, this.document.baseURI).searchParams;
    if (!query.has(CODE_PARAM) || !query.has(STATE_PARAM)) {
      this.session.login();
      return;
    }
    try {
      // O serviço do kit é resolvido só aqui (`provideStynxAuth` do bootstrap real).
      await this.injector.get(StynxSessionService).completeLogin(url);
      await this.router.navigate([HOME]);
    } catch (failure: unknown) {
      // Estado de tela `rait.states.error` (spec §5.1) sobre a classificação do ErrorBoundary
      // (que fornece `requestId`, `status`, `context`); o texto da página é o do estado.
      this.error.set({ ...classifyError(failure), messageKey: ERROR_KEY });
    }
  }
}
