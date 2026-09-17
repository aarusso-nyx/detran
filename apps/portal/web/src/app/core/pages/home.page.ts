// Home pública `/` (portal-frontends.md §4: "home pública → catálogo + entrada gov.br"; §3
// anônimo). Nesta entrega: entrada gov.br (retomando `?retomar=<rota>` do `portalAuthGuard`)
// e atalho para a Carta de Serviços; o catálogo (`GET /v1/portal/services`) chega com o módulo
// `catalogo` (CTG-0003).
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { map } from 'rxjs';
import { AuthFlowService } from '../auth-flow.service';
import { RESUME_QUERY_PARAM } from '../guards/auth.guard';

@Component({
  selector: 'portal-home-page',
  imports: [RouterLink, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-screen': '' },
  template: `
    <h1>{{ 'portal.shell.title.home' | stynxTranslate }}</h1>
    <p>
      <button type="button" class="portal-primary" (click)="login()">
        {{ 'portal.common.action.login' | stynxTranslate }}
      </button>
    </p>
    <p>
      <a routerLink="/carta-servicos">{{
        'portal.common.link.carta' | stynxTranslate
      }}</a>
    </p>
  `,
})
export class HomePageComponent {
  private readonly auth = inject(AuthFlowService);
  private readonly route = inject(ActivatedRoute);

  readonly retomar = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => params.get(RESUME_QUERY_PARAM)),
    ),
    { initialValue: null },
  );

  login(): void {
    this.auth.login(this.retomar());
  }
}
