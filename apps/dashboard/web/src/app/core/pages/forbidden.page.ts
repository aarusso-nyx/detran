// `/monitoramento/sem-permissao` (CTG-0002.md §3): recusa explicada, com o caminho pedido
// visível como token (`<code>`) e o caminho de volta. Nunca navega sozinha.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DetranErrorStateComponent, StynxTranslatePipe } from '@detran/ui';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FORBIDDEN_FROM_PARAM } from '../guards/permission.guard';

@Component({
  selector: 'dash-forbidden-page',
  imports: [RouterLink, DetranErrorStateComponent, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-screen': '' },
  template: `
    <h1>{{ 'dashboard.shell.title.sem_permissao' | stynxTranslate }}</h1>
    <detran-error-state
      [title]="'dashboard.states.forbidden' | stynxTranslate"
      [message]="'dashboard.errors.forbidden_action' | stynxTranslate"
    />
    @if (from(); as url) {
      <p>
        <code>{{ url }}</code>
      </p>
    }
    <p>
      <a routerLink="/monitoramento">{{
        'dashboard.common.action.back' | stynxTranslate
      }}</a>
    </p>
  `,
})
export class ForbiddenPageComponent {
  private readonly route = inject(ActivatedRoute);

  /** Só exibido: a rota pedida nunca vira navegação automática. */
  protected readonly from = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => params.get(FORBIDDEN_FROM_PARAM) ?? ''),
    ),
    { initialValue: '' },
  );
}
