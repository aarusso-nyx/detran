// T-40 Membros (ficha IU-RAIT-047; contrato CTG-0002b §6.1 linha 45; L1 — M13): `createListFacade(
// q => worklist.listRaitPoolMember(q))` numa `<stynx-table>` (pool_id, person_id, member_role,
// status → `tokenKey('memberStatus')`, is_substitute, mandate_starts_on, mandate_ends_on,
// representation_block). Nenhum comando (`cmd.mandate` sem uso, OD-R12-034). Lista sincronizada
// com a URL.
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
import { tokenKey } from '../../../core/i18n-token-key';
import { WorklistClient } from '../../../data/api/worklist.client';
import {
  LIST_PAGE_SIZE_DEFAULT,
  type RaitPoolMember,
} from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { createL1List, l1Formatters, type L1Row } from '../../l1-list';
import { EMPTY_KEY, LOADING_KEY } from '../../page-support';

const TITLE_KEY = 'rait.screens.organizacao-membros.title';

interface Row extends L1Row {
  readonly pool_id: string;
  readonly person_id: string;
  readonly member_role: string;
  readonly status: string;
  readonly is_substitute: string;
  readonly mandate_starts_on: string;
  readonly mandate_ends_on: string;
  readonly representation_block: string;
}

@Component({
  selector: 'rait-members-page',
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
export class MembersPageComponent {
  private readonly worklist = inject(WorklistClient);
  private readonly format = l1Formatters();
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly pageSize = LIST_PAGE_SIZE_DEFAULT;

  readonly l1 = createL1List<RaitPoolMember, Row>({
    load: (query) => this.worklist.listRaitPoolMember(query),
    columns: [
      'pool_id',
      'person_id',
      'member_role',
      'status',
      'is_substitute',
      'mandate_starts_on',
      'mandate_ends_on',
      'representation_block',
    ],
    toRow: (item) => ({
      id: item.id,
      pool_id: item.pool_id,
      person_id: item.person_id,
      member_role: item.member_role,
      status: this.format.translate(tokenKey('memberStatus', item.status)),
      is_substitute: this.format.bool(item.is_substitute),
      mandate_starts_on: this.format.date(item.mandate_starts_on),
      mandate_ends_on: this.format.date(item.mandate_ends_on),
      representation_block: this.format.text(item.representation_block),
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
