// T-38 Amostragem de qualidade (ficha IU-RAIT-045; contrato CTG-0002b §6.1 linha 43; L1 — M13):
// `createListFacade(q => org.listRaitQualitySample(q))` numa `<stynx-table>` (case_id,
// period_start, period_end, reviewer_member_id, finding_kind, systemic). Nenhum comando
// (`cmd.review` sem uso, OD-R12-034). Lista sincronizada com a URL.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
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
  type RaitQualitySample,
} from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { createL1List, l1Formatters, type L1Row } from '../../l1-list';
import { EMPTY_KEY, LOADING_KEY } from '../../page-support';

const TITLE_KEY = 'rait.screens.gestao-qualidade.title';

interface Row extends L1Row {
  readonly case_id: string;
  readonly period_start: string;
  readonly period_end: string;
  readonly reviewer_member_id: string;
  readonly finding_kind: string;
  readonly systemic: string;
}

@Component({
  selector: 'rait-quality-sampling-page',
  imports: [
    StynxTranslatePipe,
    StynxTableComponent,
    StynxPaginationComponent,
    PageStateComponent,
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
export class QualitySamplingPageComponent {
  private readonly org = inject(OrgClient);
  private readonly format = l1Formatters();
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly pageSize = LIST_PAGE_SIZE_DEFAULT;

  readonly l1 = createL1List<RaitQualitySample, Row>({
    load: (query) => this.org.listRaitQualitySample(query),
    columns: [
      'case_id',
      'period_start',
      'period_end',
      'reviewer_member_id',
      'finding_kind',
      'systemic',
    ],
    toRow: (item) => ({
      id: item.id,
      case_id: item.case_id,
      period_start: this.format.date(item.period_start),
      period_end: this.format.date(item.period_end),
      reviewer_member_id: this.format.text(item.reviewer_member_id),
      finding_kind: this.format.text(item.finding_kind),
      systemic: this.format.bool(item.systemic),
    }),
  });

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
