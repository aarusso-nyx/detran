// T-41 Pools (ficha IU-RAIT-048; contrato CTG-0002b §6.1 linha 46; L1 — M13): `createListFacade(
// q => worklist.listRaitPool(q))` numa `<stynx-table>` (name, instance → `rait.instance.`,
// circuit, strategy → `rait.common.strategy_` + token, active, priority_policy). Nenhum comando
// (`cmd.update` sem uso, OD-R12-034). Lista sincronizada com a URL.
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
import { WorklistClient } from '../../../data/api/worklist.client';
import { LIST_PAGE_SIZE_DEFAULT, type RaitPool } from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { createL1List, l1Formatters, type L1Row } from '../../l1-list';
import { EMPTY_KEY, LOADING_KEY } from '../../page-support';

const TITLE_KEY = 'rait.screens.organizacao-pools.title';
const INSTANCE_KEY_PREFIX = 'rait.instance.';
const STRATEGY_KEY_PREFIX = 'rait.common.strategy_';

interface Row extends L1Row {
  readonly name: string;
  readonly instance: string;
  readonly circuit: string;
  readonly strategy: string;
  readonly active: string;
  readonly priority_policy: string;
}

@Component({
  selector: 'rait-pools-page',
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
export class PoolsPageComponent {
  private readonly worklist = inject(WorklistClient);
  private readonly format = l1Formatters();
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly pageSize = LIST_PAGE_SIZE_DEFAULT;

  readonly l1 = createL1List<RaitPool, Row>({
    load: (query) => this.worklist.listRaitPool(query),
    columns: [
      'name',
      'instance',
      'circuit',
      'strategy',
      'active',
      'priority_policy',
    ],
    toRow: (item) => ({
      id: item.id,
      name: item.name,
      instance: this.format.translate(`${INSTANCE_KEY_PREFIX}${item.instance}`),
      circuit: this.format.text(item.circuit),
      strategy: this.format.translate(`${STRATEGY_KEY_PREFIX}${item.strategy}`),
      active: this.format.bool(item.active),
      priority_policy: item.priority_policy,
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
