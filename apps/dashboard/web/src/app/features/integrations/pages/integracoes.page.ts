// D-06 Saúde técnica (IU-DASH-D-06; CTG-0002.md §9). L0 — sobe a L2 quando
// `integrations.client.ts` (gerado de BP-DASH-MONITOR-001) existir. Bloco D: a fonte
// indisponível é selo, nunca erro. Sem comando nesta tela; o detalhe é rota própria.
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { DeepLinkButtonComponent } from '../../../shared/deep-link-button.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import { SeverityChipComponent } from '../../../shared/severity-chip.component';
import { SourceStatusTableComponent } from '../../../shared/source-status-table.component';
import { SEVERITY_LEVELS, type SourceStatusView } from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

type IntegrationHealthState = Exclude<
  ScreenState<readonly SourceStatusView[]>,
  { kind: 'blocked_by_decision' }
>;

@Component({
  selector: 'dash-integracoes-page',
  imports: [
    ScreenFrameComponent,
    DeepLinkButtonComponent,
    FreshnessSealComponent,
    SeverityChipComponent,
    SourceStatusTableComponent,
    RouterLink,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame
      [slug]="'integracoes'"
      [screen]="'P-04'"
      [block]="'D'"
      [state]="state()"
    >
      <dash-source-status-table [sources]="sources()" />
      <ul>
        @for (source of sources(); track source.source) {
          <li>
            <dash-freshness-seal [freshness]="source.freshness" [block]="'D'">
              <code data-field="source">{{ source.source }}</code>
            </dash-freshness-seal>
            <a [routerLink]="['/monitoramento/integracoes', source.source]">{{
              'dashboard.common.action.view' | stynxTranslate
            }}</a>
            <!-- L0: o app de origem do incidente só é conhecido com R-0011. -->
            <dash-deep-link-button [app]="null" [href]="''" />
          </li>
        }
      </ul>
      <!-- Legenda de severidade (vocabulário fechado; nenhum dado inventado). -->
      <ul data-field="severity_legend">
        @for (level of SEVERITY_LEVELS; track level) {
          <li><dash-severity-chip [severity]="level" /></li>
        }
      </ul>
    </dash-screen-frame>
  `,
})
export class IntegrationHealthPageComponent {
  readonly state = mutableAccessor<IntegrationHealthState>(
    UNAVAILABLE_IN_VERSION,
  );

  protected readonly SEVERITY_LEVELS = SEVERITY_LEVELS;

  protected readonly sources = computed<readonly SourceStatusView[]>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : [];
  });
}
