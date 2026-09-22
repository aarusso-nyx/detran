// D-10 Comparativo (IU-DASH-D-10; CTG-0002.md §9). L0 — sobe a L2 quando `comparison.client.ts`
// (gerado de BP-DASH-MONITOR-001) existir. Abre em distribuição, nunca em ranking (§2 invariante
// 8); meta e teto são dois elementos distintos; a exportação sai com classificação e camada à
// vista e é decidida pelo servidor.
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { DashCanDirective } from '../../../core/can.directive';
import { createCommandNotice } from '../../../core/command-notice';
import { DashErrorBannerComponent } from '../../../core/error-banner.component';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { ClassificationBadgeComponent } from '../../../shared/classification-badge.component';
import { DistributionChartComponent } from '../../../shared/distribution-chart.component';
import { ExportDialogComponent } from '../../../shared/export-dialog.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import { LayerGateComponent } from '../../../shared/layer-gate.component';
import { SuppressedCellComponent } from '../../../shared/suppressed-cell.component';
import { TargetVsCeilingComponent } from '../../../shared/target-vs-ceiling.component';
import { StynxTranslatePipe } from '@detran/ui';
import type {
  DistributionSeries,
  LegalCeilingView,
  OperationalTargetView,
} from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

interface ComparisonData {
  readonly series: DistributionSeries;
  readonly target: OperationalTargetView | null;
  readonly ceiling: LegalCeilingView | null;
}

type ComparisonState = Exclude<
  ScreenState<ComparisonData>,
  { kind: 'blocked_by_decision' }
>;

const EXPORT_COMMAND = 'dashboard:export:create';
const SUPPRESSION_FOOTNOTE_ID = 'dash-comparativo-suppression';

@Component({
  selector: 'dash-comparativo-page',
  imports: [
    ScreenFrameComponent,
    ClassificationBadgeComponent,
    DashCanDirective,
    DashErrorBannerComponent,
    DistributionChartComponent,
    ExportDialogComponent,
    FreshnessSealComponent,
    LayerGateComponent,
    SuppressedCellComponent,
    TargetVsCeilingComponent,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame
      [slug]="'comparativo'"
      [screen]="'P-06'"
      [block]="'C'"
      [state]="state()"
    >
      @if (data(); as data) {
        <dash-distribution-chart [series]="data.series" [block]="'C'" />
        <!-- Nota de rodapé da supressão (o limiar vem do backend; §8 item 12). -->
        <p [attr.id]="SUPPRESSION_FOOTNOTE_ID">
          <dash-suppressed-cell
            [threshold]="suppressionThreshold()"
            [footnoteId]="SUPPRESSION_FOOTNOTE_ID"
          />
        </p>
        <dash-target-vs-ceiling
          [target]="data.target"
          [ceiling]="data.ceiling"
        />
        <dash-classification-badge [classification]="null" />
        <dash-freshness-seal [freshness]="null" [block]="'C'" />
        <button type="button" (click)="gateOpen(true)">
          {{ 'dashboard.layers.n2' | stynxTranslate }}
        </button>
        <dash-layer-gate
          [open]="gateOpen()"
          (declared)="gateOpen(false)"
          (cancelled)="gateOpen(false)"
        />
        <button
          *dashCan="EXPORT_COMMAND"
          type="button"
          data-command="dashboard:export:create"
          (click)="openExport()"
        >
          {{ 'dashboard.common.action.export' | stynxTranslate }}
        </button>
        <dash-export-dialog
          [open]="exportOpen()"
          [classification]="null"
          [layer]="'N1'"
          [scope]="'D-10'"
          [filters]="EMPTY_FILTERS"
          [rows]="null"
          [approvalRows]="null"
          [formats]="EMPTY_FORMATS"
          (requested)="notice.unavailable(EXPORT_COMMAND)"
          (cancelled)="exportOpen(false)"
        />
        @if (notice.error(); as error) {
          <dash-error-banner [error]="error" />
        }
      }
    </dash-screen-frame>
  `,
})
export class ComparisonPageComponent {
  readonly state = mutableAccessor<ComparisonState>(UNAVAILABLE_IN_VERSION);
  readonly gateOpen = mutableAccessor(false);
  readonly exportOpen = mutableAccessor(false);
  protected readonly notice = createCommandNotice();

  protected readonly EXPORT_COMMAND = EXPORT_COMMAND;
  protected readonly SUPPRESSION_FOOTNOTE_ID = SUPPRESSION_FOOTNOTE_ID;
  protected readonly EMPTY_FILTERS: Readonly<Record<string, string>> = {};
  protected readonly EMPTY_FORMATS: readonly string[] = [];

  protected readonly data = computed<ComparisonData | null>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : null;
  });

  /** O limiar chega marcado nas barras suprimidas; `null` enquanto não houver leitura. */
  protected readonly suppressionThreshold = computed<number | null>(
    () =>
      this.data()?.series.bars.find((bar) => bar.suppressed)?.threshold ?? null,
  );

  protected openExport(): void {
    this.exportOpen(true);
  }
}
