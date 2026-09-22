// Rota `**` (contrato CTG-0002a §3; catálogo de erros §2 NOT_FOUND): "não encontrado" com
// caminho de volta a `/`; `data-screen=""` (coringa técnica fora do manifesto).
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DetranErrorStateComponent, StynxTranslatePipe } from '@detran/ui';

export const NOT_FOUND_KEY = 'rait.states.not_found';
export const BACK_KEY = 'rait.common.back';

@Component({
  selector: 'rait-not-found-page',
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
      <a routerLink="/">{{ backKey | stynxTranslate }}</a>
    </p>
  `,
})
export class NotFoundPageComponent {
  readonly titleKey = NOT_FOUND_KEY;
  readonly backKey = BACK_KEY;
}
