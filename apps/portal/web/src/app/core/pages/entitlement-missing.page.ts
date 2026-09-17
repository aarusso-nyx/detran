// `/vinculo/por-que-nao-vejo` (plan.md M7/M8; portal-error-catalog.md §8 `NOT_FOUND` /
// `ENTITLEMENT_REQUIRED`): explica que não há vínculo com o registro e mostra os caminhos —
// ouvidoria e atendimento presencial (invariantes 6 e 8: canal digital nunca é o único; nunca
// "acesso negado" seco). `recurso`/`id` da query ficam em `data-*` para suporte (invariante 1).
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { map } from 'rxjs';

@Component({
  selector: 'portal-entitlement-missing-page',
  imports: [RouterLink, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': '',
    '[attr.data-recurso]': 'recurso()',
    '[attr.data-id]': 'id()',
  },
  template: `
    <h1>{{ 'portal.shell.title.vinculo' | stynxTranslate }}</h1>
    <p>{{ 'portal.states.entitlement_missing' | stynxTranslate }}</p>
    <ul>
      <li>
        <a routerLink="/ouvidoria/nova">{{
          'portal.common.link.ouvidoria' | stynxTranslate
        }}</a>
      </li>
      <li>
        <a routerLink="/carta-servicos">{{
          'portal.common.link.presencial' | stynxTranslate
        }}</a>
      </li>
    </ul>
    <p>
      <a routerLink="/inicio">{{
        'portal.common.action.home' | stynxTranslate
      }}</a>
    </p>
  `,
})
export class EntitlementMissingPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly recurso = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('recurso'))),
    { initialValue: null },
  );

  readonly id = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );
}
