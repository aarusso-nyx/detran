// `/servico-indisponivel/:serviceKey` (plan.md M7/M8/M15; portal-error-catalog.md §8
// `SERVICE_UNAVAILABLE`): motivo do catálogo + canal alternativo, nunca 404. O motivo é um token
// do catálogo (`unavailableReason`): fica em `data-token`, nunca é exibido cru (invariante 1);
// o texto cidadão é `alternativeChannelNote`, redigido pelo órgão no catálogo.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DetranErrorStateComponent, StynxTranslatePipe } from '@detran/ui';
import { from, map, of, switchMap } from 'rxjs';
import {
  ServiceCatalogFacade,
  type ServiceAvailability,
} from '../service-catalog.facade';

@Component({
  selector: 'portal-service-unavailable-page',
  imports: [RouterLink, DetranErrorStateComponent, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': '',
    '[attr.data-service-key]': 'serviceKey()',
    '[attr.data-token]': 'availability()?.reason ?? null',
  },
  template: `
    <h1>{{ 'portal.shell.title.servico_indisponivel' | stynxTranslate }}</h1>
    <detran-error-state
      [title]="'portal.shell.title.servico_indisponivel' | stynxTranslate"
      [message]="'portal.states.service_unavailable' | stynxTranslate"
    />
    @if (availability()?.alternativeChannelNote; as note) {
      <h2>{{ 'portal.common.label.alternative_channel' | stynxTranslate }}</h2>
      <p>{{ note }}</p>
    }
    <ul>
      <li>
        <a routerLink="/carta-servicos">{{
          'portal.common.link.carta' | stynxTranslate
        }}</a>
      </li>
      <li>
        <a routerLink="/ouvidoria/nova">{{
          'portal.common.link.ouvidoria' | stynxTranslate
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
export class ServiceUnavailablePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(ServiceCatalogFacade);

  readonly serviceKey = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('serviceKey') ?? '')),
    { initialValue: '' },
  );

  readonly availability = toSignal<ServiceAvailability | null>(
    this.route.paramMap.pipe(
      map((params) => params.get('serviceKey')),
      switchMap((key) =>
        key
          ? from(this.catalog.availability(key)).pipe(
              map((value): ServiceAvailability | null => value),
            )
          : of(null),
      ),
    ),
    { initialValue: null },
  );
}
