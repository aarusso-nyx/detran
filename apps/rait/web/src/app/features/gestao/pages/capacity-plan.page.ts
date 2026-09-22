// T-35 Capacidade (ficha IU-RAIT-042; contrato CTG-0002b §6.1 linha 40; L1 — M13): `createListFacade(
// q => org.listRaitCapacityPlan(q))` numa `<stynx-table>` (pool_id, period_start, period_end,
// arrival_estimate, capacity_estimate, queue_observed, months_over_capacity,
// reinforcement_requested); `KpiTile` `kpi.loaded` = `total` (sem meta/teto — o contrato não
// distingue plano ativo); `TrendChart` com série vazia. Nenhum comando (`cmd.publish` sem uso,
// OD-R12-034). Lista sincronizada com a URL.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  StynxIntlDatePipe,
  StynxPaginationComponent,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { OrgClient } from '../../../data/api/org.client';
import {
  LIST_PAGE_SIZE_DEFAULT,
  type RaitCapacityPlan,
} from '../../../data/models';
import { KpiTileComponent } from '../../../shared/kpi-tile.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import {
  TrendChartComponent,
  type TrendPoint,
} from '../../../shared/trend-chart.component';
import { createL1List, l1Formatters, type L1Row } from '../../l1-list';
import { EMPTY_KEY, LOADING_KEY } from '../../page-support';

const TITLE_KEY = 'rait.screens.gestao-capacidade.title';
const KPI_LOADED_KEY = 'rait.screens.gestao-capacidade.kpi.loaded';
const EMPTY_SERIES: readonly TrendPoint[] = [];

interface Row extends L1Row {
  readonly pool_id: string;
  readonly period_start: string;
  readonly period_end: string;
  readonly arrival_estimate: string;
  readonly capacity_estimate: string;
  readonly queue_observed: string;
  readonly months_over_capacity: string;
  readonly reinforcement_requested: string;
}

@Component({
  selector: 'rait-capacity-plan-page',
  imports: [
    StynxTranslatePipe,
    StynxTableComponent,
    StynxPaginationComponent,
    PageStateComponent,
    KpiTileComponent,
    TrendChartComponent,
  ],
  providers: [...provideRaitI18nFallback(), StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'l1.facade.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-page-state
      [status]="l1.facade.status()"
      [error]="l1.facade.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="l1.reload()"
    />
    <rait-kpi-tile [labelKey]="kpiLoadedKey" [value]="total()" />
    <rait-trend-chart [labelKey]="kpiLoadedKey" [series]="series" />
    <stynx-table
      [columns]="l1.columns"
      [rows]="l1.rows()"
      [rowTrackBy]="l1.trackRow"
    />
    <stynx-pagination
      [totalItems]="l1.facade.value()?.total ?? 0"
      [page]="(l1.facade.value()?.page ?? 1) - 1"
      [pageSizeInput]="l1.facade.value()?.pageSize ?? pageSize"
      (pageChange)="l1.list.onPageChange($event)"
    />
  `,
})
export class CapacityPlanPageComponent {
  private readonly org = inject(OrgClient);
  private readonly format = l1Formatters();
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly kpiLoadedKey = KPI_LOADED_KEY;
  readonly series = EMPTY_SERIES;
  readonly pageSize = LIST_PAGE_SIZE_DEFAULT;

  readonly l1 = createL1List<RaitCapacityPlan, Row>({
    load: (query) => this.org.listRaitCapacityPlan(query),
    columns: [
      'pool_id',
      'period_start',
      'period_end',
      'arrival_estimate',
      'capacity_estimate',
      'queue_observed',
      'months_over_capacity',
      'reinforcement_requested',
    ],
    toRow: (item) => ({
      id: item.id,
      pool_id: item.pool_id,
      period_start: this.format.date(item.period_start),
      period_end: this.format.date(item.period_end),
      arrival_estimate: this.format.text(item.arrival_estimate),
      capacity_estimate: this.format.text(item.capacity_estimate),
      queue_observed: this.format.text(item.queue_observed),
      months_over_capacity: this.format.text(item.months_over_capacity),
      reinforcement_requested: this.format.bool(item.reinforcement_requested),
    }),
  });
  readonly total = computed(() => this.l1.facade.value()?.total ?? null);

  constructor() {
    afterRenderEffect(() => {
      const status = this.l1.facade.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }
}
