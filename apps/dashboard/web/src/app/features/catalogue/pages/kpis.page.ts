// D-18 KPIs do painel (IU-DASH-D-18; CTG-0002.md §9). L0 — sobe a L2 quando
// `catalogue.client.ts` (gerado de BP-DASH-MONITOR-001) existir. O nome de cada KPI não tem
// chave na semente: vai em `data-kpi` (OD-D16-012), nunca um texto inventado.
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { ClassificationBadgeComponent } from '../../../shared/classification-badge.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import { TargetVsCeilingComponent } from '../../../shared/target-vs-ceiling.component';
import type {
  KpiView,
  LegalCeilingView,
  OperationalTargetView,
} from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

interface KpiData {
  readonly kpis: readonly KpiView[];
  readonly target: OperationalTargetView | null;
  readonly ceiling: LegalCeilingView | null;
}

type KpiState = Exclude<ScreenState<KpiData>, { kind: 'blocked_by_decision' }>;

@Component({
  selector: 'dash-kpis-page',
  imports: [
    ScreenFrameComponent,
    ClassificationBadgeComponent,
    FreshnessSealComponent,
    TargetVsCeilingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame [slug]="'kpis'" [block]="'C'" [state]="state()">
      @if (data(); as data) {
        <ul>
          @for (kpi of data.kpis; track kpi.key) {
            <li [attr.data-kpi]="kpi.key">
              <dash-freshness-seal [freshness]="kpi.freshness" [block]="'C'">
                <span data-field="value">{{ kpi.value }}</span>
              </dash-freshness-seal>
            </li>
          }
        </ul>
        <dash-target-vs-ceiling
          [target]="data.target"
          [ceiling]="data.ceiling"
        />
        <dash-classification-badge [classification]="null" />
      }
    </dash-screen-frame>
  `,
})
export class SelfKpiPageComponent {
  readonly state = mutableAccessor<KpiState>(UNAVAILABLE_IN_VERSION);

  protected readonly data = computed<KpiData | null>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : null;
  });
}
