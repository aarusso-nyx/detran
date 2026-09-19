// T-15 Como funciona a pontuação (contrato CTG-0003c §6; ficha IU-PORTAL-T15; [JRN-PORTAL-004];
// [RN-RAIT-131]; [DIVERGE-22]/OD-P90): página estática — o conteúdo versionado
// (`GET content/points-explainer`) não tem operação gerada nesta rodada: título e introdução do
// catálogo, aviso `role="status"` de indisponibilidade nesta versão e os links a `/autos` e à
// Carta de Serviços. Nenhuma leitura, nenhum cálculo de pontos.
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';

const AUTOS_ROUTE = '/autos';
const CHARTER_ROUTE = '/carta-servicos';

@Component({
  selector: 'portal-points-explainer-page',
  imports: [RouterLink, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-screen': 'T-15' },
  template: `
    <h1 tabindex="-1">{{ 'portal.screens.t15.title' | stynxTranslate }}</h1>
    <p>{{ 'portal.screens.t15.intro' | stynxTranslate }}</p>
    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      <p data-versioned-content>
        {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
      </p>
    </div>
    <ul class="portal-points-links">
      <li>
        <a [routerLink]="autosRoute" [attr.routerLink]="autosRoute">{{
          'portal.shell.nav.autos' | stynxTranslate
        }}</a>
      </li>
      <li>
        <a [routerLink]="charterRoute" [attr.routerLink]="charterRoute">{{
          'portal.common.link.carta' | stynxTranslate
        }}</a>
      </li>
    </ul>
  `,
})
export class PointsExplainerPageComponent {
  readonly autosRoute = AUTOS_ROUTE;
  readonly charterRoute = CHARTER_ROUTE;
}
