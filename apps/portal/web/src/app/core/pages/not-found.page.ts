// Rota `**` (plan.md M7): "página não encontrada" com caminho de volta; `data-screen=""`.
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DetranErrorStateComponent, StynxTranslatePipe } from '@detran/ui';

export const NOT_FOUND_KEY = 'portal.states.not_found';

@Component({
  selector: 'portal-not-found-page',
  imports: [RouterLink, DetranErrorStateComponent, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-screen': '' },
  template: `
    <h1>{{ titleKey | stynxTranslate }}</h1>
    <detran-error-state
      [title]="titleKey | stynxTranslate"
      [message]="titleKey | stynxTranslate"
    />
    <p>
      <a routerLink="/">{{ 'portal.common.action.home' | stynxTranslate }}</a>
    </p>
  `,
})
export class NotFoundPageComponent {
  readonly titleKey = NOT_FOUND_KEY;
}
