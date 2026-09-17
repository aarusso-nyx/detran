// `/auth/callback` (portal-frontends.md §4: retorno OIDC): conclui a sessão STYNX a partir da
// URL de retorno e navega à rota retomada (`ResumeService`) ou a `/inicio`. Enquanto conclui,
// estado "carregando"; se não conclui, estado de erro com caminho de volta — nunca tela vazia.
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  type OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DetranErrorStateComponent,
  DetranLoadingStateComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { AuthFlowService } from '../auth-flow.service';

@Component({
  selector: 'portal-auth-callback-page',
  imports: [
    RouterLink,
    DetranErrorStateComponent,
    DetranLoadingStateComponent,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-screen': '' },
  template: `
    <h1>{{ 'portal.shell.title.auth_callback' | stynxTranslate }}</h1>
    @if (failed()) {
      <detran-error-state
        [title]="'portal.states.error' | stynxTranslate"
        [message]="'portal.states.error' | stynxTranslate"
      />
      <p>
        <a routerLink="/">{{ 'portal.common.action.home' | stynxTranslate }}</a>
      </p>
    } @else {
      <detran-loading-state
        [label]="'portal.states.loading' | stynxTranslate"
      />
    }
  `,
})
export class AuthCallbackPageComponent implements OnInit {
  private readonly auth = inject(AuthFlowService);
  private readonly document = inject(DOCUMENT);

  readonly failed = signal(false);

  async ngOnInit(): Promise<void> {
    const url = this.document.location?.href ?? '';
    const completed = await this.auth.completeLogin(url).catch(() => false);
    if (!completed) this.failed.set(true);
  }
}
