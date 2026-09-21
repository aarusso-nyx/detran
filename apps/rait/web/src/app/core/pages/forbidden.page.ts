// `/sem-permissao` (plan.md M4/A2; contrato CTG-0002a §3): destino do `roleGuard`; título
// `rait.states.forbidden`, mensagem `rait.errors.forbidden`, link de volta a `/`. Lê `?de=` só
// para exibir a rota pedida — nunca navega automaticamente. Sem `data-screen` (M14/C-2A-13: a
// negação por papel não produz tela; `screenElement` do harness deve ser nulo).
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DetranErrorStateComponent, StynxTranslatePipe } from '@detran/ui';
import { FORBIDDEN_FROM_PARAM } from '../guards/role.guard';

export const FORBIDDEN_TITLE_KEY = 'rait.states.forbidden';
export const FORBIDDEN_MESSAGE_KEY = 'rait.errors.forbidden';
const BACK_KEY = 'rait.common.back';

@Component({
  selector: 'rait-forbidden-page',
  imports: [RouterLink, DetranErrorStateComponent, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>{{ titleKey | stynxTranslate }}</h1>
    <detran-error-state
      [title]="titleKey | stynxTranslate"
      [message]="messageKey | stynxTranslate"
    />
    @if (from) {
      <p>
        <code data-from>{{ from }}</code>
      </p>
    }
    <p>
      <a routerLink="/">{{ backKey | stynxTranslate }}</a>
    </p>
  `,
})
export class ForbiddenPageComponent {
  readonly titleKey = FORBIDDEN_TITLE_KEY;
  readonly messageKey = FORBIDDEN_MESSAGE_KEY;
  readonly backKey = BACK_KEY;
  /** Rota pedida (`?de=`), só para exibição. */
  readonly from =
    inject(ActivatedRoute).snapshot?.queryParamMap?.get(FORBIDDEN_FROM_PARAM) ??
    null;
}
