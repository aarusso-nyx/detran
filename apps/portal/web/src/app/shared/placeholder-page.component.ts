// PlaceholderPageComponent (plan.md M8; engineer-frontend.md §Regras 1): página de rota ainda
// não construída — `DetranErrorStateComponent` "indisponível nesta versão" e `data-screen`
// com a tela (`T-nn`) lida do `data` da rota (`""` quando a rota não tem tela). Uma por rota
// até o CTG-0003 substituir pelos componentes reais.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DetranErrorStateComponent, StynxTranslatePipe } from '@detran/ui';
import { map } from 'rxjs';

export const UNAVAILABLE_IN_VERSION_KEY =
  'portal.states.unavailable_in_version';

@Component({
  selector: 'portal-placeholder-page',
  imports: [DetranErrorStateComponent, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-screen]': 'screen()' },
  template: `
    <detran-error-state
      [title]="titleKey | stynxTranslate"
      [message]="titleKey | stynxTranslate"
    />
  `,
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly titleKey = UNAVAILABLE_IN_VERSION_KEY;

  readonly screen = toSignal(
    this.route.data.pipe(
      map((data) => (typeof data['screen'] === 'string' ? data['screen'] : '')),
    ),
    { initialValue: '' },
  );
}
