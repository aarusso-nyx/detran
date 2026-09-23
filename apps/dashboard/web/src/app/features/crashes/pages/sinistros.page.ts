// D-13 Estatística de sinistros (IU-DASH-D-13; CTG-0002.md §9). L0 — sobe a L2 quando
// `crashes.client.ts` (gerado de BP-DASH-MONITOR-001) existir. Única tela cuja variante
// "bloqueado por decisão" é admitida (estado residual, ficha §5): a decisão citada vem do dado,
// nunca atribuída aqui. Supressão (primária e secundária) é do backend.
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { ClassificationBadgeComponent } from '../../../shared/classification-badge.component';
import { DistributionChartComponent } from '../../../shared/distribution-chart.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import { SuppressedCellComponent } from '../../../shared/suppressed-cell.component';
import type { DistributionSeries } from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

type CrashState = ScreenState<DistributionSeries>;

const SUPPRESSION_FOOTNOTE_ID = 'dash-sinistros-suppression';

@Component({
  selector: 'dash-sinistros-page',
  imports: [
    ScreenFrameComponent,
    ClassificationBadgeComponent,
    DistributionChartComponent,
    FreshnessSealComponent,
    SuppressedCellComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame
      [slug]="'sinistros'"
      [screen]="'P-09'"
      [block]="'B'"
      [state]="state()"
    >
      @if (series(); as series) {
        <dash-distribution-chart [series]="series" [block]="'B'" />
        <p [attr.id]="SUPPRESSION_FOOTNOTE_ID">
          <dash-suppressed-cell
            [threshold]="suppressionThreshold()"
            [footnoteId]="SUPPRESSION_FOOTNOTE_ID"
          />
        </p>
        <dash-classification-badge [classification]="null" />
        <dash-freshness-seal [freshness]="null" [block]="'B'" />
      }
    </dash-screen-frame>
  `,
})
export class CrashStatisticsPageComponent {
  readonly state = mutableAccessor<CrashState>(UNAVAILABLE_IN_VERSION);

  protected readonly SUPPRESSION_FOOTNOTE_ID = SUPPRESSION_FOOTNOTE_ID;

  protected readonly series = computed<DistributionSeries | null>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : null;
  });

  protected readonly suppressionThreshold = computed<number | null>(
    () => this.series()?.bars.find((bar) => bar.suppressed)?.threshold ?? null,
  );
}
