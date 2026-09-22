// T-34 Produção (ficha IU-RAIT-041; contrato CTG-0002b §6.1 linha 39; L1 — M13): `createListFacade(
// q => worklist.listRaitAssignment(q))` numa `<stynx-table>` (case_id, member_id, pool_id,
// assigned_at, active, release_reason); `KpiTile` `kpi.loaded` = `total` (meta/teto sem fonte);
// `TrendChart` com série vazia (sem endpoint de séries → estado vazio). Nenhum comando
// (OD-R12-015/034). Lista sincronizada com a URL.
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
import { WorklistClient } from '../../../data/api/worklist.client';
import {
  LIST_PAGE_SIZE_DEFAULT,
  type RaitAssignment,
} from '../../../data/models';
import { KpiTileComponent } from '../../../shared/kpi-tile.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import {
  TrendChartComponent,
  type TrendPoint,
} from '../../../shared/trend-chart.component';
import { createL1List, l1Formatters, type L1Row } from '../../l1-list';
import { LOADING_KEY } from '../../page-support';

const TITLE_KEY = 'rait.screens.gestao-producao.title';
const EMPTY_KEY = 'rait.screens.gestao-producao.empty';
const KPI_LOADED_KEY = 'rait.screens.gestao-producao.kpi.loaded';
/** Sem endpoint de séries (§6.1): série vazia → estado vazio do `TrendChart`. */
const EMPTY_SERIES: readonly TrendPoint[] = [];

interface Row extends L1Row {
  readonly case_id: string;
  readonly member_id: string;
  readonly pool_id: string;
  readonly assigned_at: string;
  readonly active: string;
  readonly release_reason: string;
}

@Component({
  selector: 'rait-production-page',
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
export class ProductionPageComponent {
  private readonly worklist = inject(WorklistClient);
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

  readonly l1 = createL1List<RaitAssignment, Row>({
    load: (query) => this.worklist.listRaitAssignment(query),
    columns: [
      'case_id',
      'member_id',
      'pool_id',
      'assigned_at',
      'active',
      'release_reason',
    ],
    toRow: (item) => ({
      id: item.id,
      case_id: item.case_id,
      member_id: item.member_id,
      pool_id: item.pool_id,
      assigned_at: this.format.date(item.assigned_at),
      active: this.format.bool(item.active),
      release_reason: this.format.text(item.release_reason),
    }),
  });
  /** Contagem de registros carregados (cap 500), rotulada assim. */
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
