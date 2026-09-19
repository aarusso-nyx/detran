// /acessibilidade (contrato CTG-0003c §6/§3.10; [RN-PORTAL-113] "Padrão técnico adotado"; A1):
// declaração estática do padrão adotado — WCAG 2.1 AA + eMAG 3.1 (textos do catálogo, OD-P89) —
// com o link externo `accessibilityUrl` da marca quando disponível e os caminhos para relatar
// uma barreira (ouvidoria) e para a Carta de Serviços. Sem leitura própria.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { BrandService } from '../brand.service';

const OUVIDORIA_ROUTE = '/ouvidoria/nova';
const CHARTER_ROUTE = '/carta-servicos';

@Component({
  selector: 'portal-acessibilidade-page',
  imports: [RouterLink, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-screen': '' },
  template: `
    <h1 tabindex="-1">
      {{ 'portal.shell.title.acessibilidade' | stynxTranslate }}
    </h1>
    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    ></div>
    <p data-intro>{{ 'portal.shell.acessibilidade.intro' | stynxTranslate }}</p>
    <p data-standard>
      {{ 'portal.shell.acessibilidade.standard' | stynxTranslate }}
    </p>
    @if (accessibilityUrl(); as url) {
      <p>
        <a [attr.href]="url" rel="noopener" data-accessibility-url>{{
          'portal.shell.footer.acessibilidade' | stynxTranslate
        }}</a>
      </p>
    }
    <p data-contact>
      {{ 'portal.shell.acessibilidade.contact' | stynxTranslate }}
      <a [routerLink]="ouvidoriaRoute" [attr.routerLink]="ouvidoriaRoute">{{
        'portal.common.link.ouvidoria' | stynxTranslate
      }}</a>
    </p>
    <p>
      <a [routerLink]="charterRoute" [attr.routerLink]="charterRoute">{{
        'portal.common.link.carta' | stynxTranslate
      }}</a>
    </p>
  `,
})
export class AcessibilidadePageComponent {
  private readonly brand = inject(BrandService);

  readonly ouvidoriaRoute = OUVIDORIA_ROUTE;
  readonly charterRoute = CHARTER_ROUTE;

  readonly accessibilityUrl = computed<string | null>(() => {
    const brand = this.brand.state();
    return brand.status === 'available'
      ? (brand.accessibilityUrl ?? null)
      : null;
  });
}
