// BatchDrawViewer (contrato CTG-0002b §5.17; UC-RAIT-014; fichas 028/029): estado do lote por
// `tokenKey('orgState', batch.state)`, semente em `<code>` (`rait.common.seed`; null →
// `rait.common.pendingSource`), tipo por `'rait.common.batch_' + kind`, datas do servidor;
// itens em `<stynx-table>` — posição (do servidor), protocolo (`cases.get(case_id)`), membro,
// `claim_due_on` (data + `tokenKey('timer', 'T-CLAIM')`), aceite (`rait.common.accepted`/`declined`
// + `'rait.common.decline_' + decline_kind`), impedimento (`'rait.common.impediment_' + kind` dos
// impedimentos do mesmo caso). Ordem = `items` (a posição é do servidor; nunca reordena).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  StynxI18nService,
  StynxIntlDatePipe,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import type { TableColumn } from './table-column';
import { tokenKey } from '../core/i18n-token-key';
import type {
  RaitBatch,
  RaitBatchItem,
  RaitCase,
  RaitImpediment,
} from '../data/models';

const SEED_KEY = 'rait.common.seed';
const PENDING_SOURCE_KEY = 'rait.common.pendingSource';
const BATCH_KIND_KEY_PREFIX = 'rait.common.batch_';
const ACCEPTED_KEY = 'rait.common.accepted';
const DECLINED_KEY = 'rait.common.declined';
const DECLINE_KEY_PREFIX = 'rait.common.decline_';
const IMPEDIMENT_KEY_PREFIX = 'rait.common.impediment_';
const CLAIM_TIMER_CODE = 'T-CLAIM';

interface BatchItemRow extends Record<string, unknown> {
  readonly id: string;
  readonly position: string;
  readonly protocol: string;
  readonly member: string;
  readonly claimDueOn: string;
  readonly acceptance: string;
  readonly impediment: string;
}

@Component({
  selector: 'rait-batch-draw-viewer',
  imports: [StynxTranslatePipe, StynxIntlDatePipe, StynxTableComponent],
  providers: [StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-batch-draw-viewer',
    '[attr.data-batch-id]': 'batch().id',
    '[attr.data-token]': 'batch().state',
  },
  template: `
    <dl class="rait-batch-draw-viewer__summary">
      <dt>{{ batchKindKeyPrefix + batch().kind | stynxTranslate }}</dt>
      <dd [attr.data-token]="batch().state">
        {{ stateKey() | stynxTranslate }}
      </dd>
      <dt>{{ seedKey | stynxTranslate }}</dt>
      <dd>
        @if (batch().seed; as seed) {
          <code>{{ seed }}</code>
        } @else {
          <span>{{ pendingSourceKey | stynxTranslate }}</span>
        }
      </dd>
      @if (batch().drawn_at; as drawnAt) {
        <dt>drawn_at</dt>
        <dd>
          <time [attr.datetime]="drawnAt">{{ drawnAt | stynxIntlDate }}</time>
        </dd>
      }
      @if (batch().accepted_at; as acceptedAt) {
        <dt>accepted_at</dt>
        <dd>
          <time [attr.datetime]="acceptedAt">{{
            acceptedAt | stynxIntlDate
          }}</time>
        </dd>
      }
      @if (batch().homologated_at; as homologatedAt) {
        <dt>homologated_at</dt>
        <dd>
          <time [attr.datetime]="homologatedAt">{{
            homologatedAt | stynxIntlDate
          }}</time>
        </dd>
      }
    </dl>
    <stynx-table [columns]="columns" [rows]="rows()" [rowTrackBy]="trackRow" />
  `,
})
export class BatchDrawViewerComponent {
  private readonly i18n = inject(StynxI18nService);
  private readonly datePipe = inject(StynxIntlDatePipe);

  readonly batch = input.required<RaitBatch>();
  readonly items = input<readonly RaitBatchItem[]>([]);
  readonly cases = input<ReadonlyMap<string, RaitCase>>(new Map());
  readonly impediments = input<readonly RaitImpediment[]>([]);

  readonly seedKey = SEED_KEY;
  readonly pendingSourceKey = PENDING_SOURCE_KEY;
  readonly batchKindKeyPrefix = BATCH_KIND_KEY_PREFIX;
  readonly stateKey = computed(() => tokenKey('orgState', this.batch().state));

  /** Rótulos = campos do contrato (sem chave (P) para cabeçalhos de tabela; ver relatório). */
  readonly columns: TableColumn<BatchItemRow>[] = [
    { key: 'position', label: 'position' },
    { key: 'protocol', label: 'protocol_number' },
    { key: 'member', label: 'member_id' },
    { key: 'claimDueOn', label: 'claim_due_on' },
    { key: 'acceptance', label: 'accepted_at' },
    { key: 'impediment', label: 'impediment' },
  ];

  /** Ordem = `items` (posição do servidor). */
  readonly rows = computed<BatchItemRow[]>(() =>
    this.items().map((item) => ({
      id: item.id,
      position: String(item.position),
      protocol: this.cases().get(item.case_id)?.protocol_number ?? item.case_id,
      member: item.member_id ?? '',
      claimDueOn: this.claimDueOnText(item),
      acceptance: this.acceptanceText(item),
      impediment: this.impedimentText(item),
    })),
  );

  readonly trackRow = (row: BatchItemRow): string => row.id;

  private claimDueOnText(item: RaitBatchItem): string {
    if (!item.claim_due_on) return '';
    const label = this.i18n.translate(tokenKey('timer', CLAIM_TIMER_CODE));
    return `${label} ${this.datePipe.transform(item.claim_due_on)}`;
  }

  private acceptanceText(item: RaitBatchItem): string {
    if (item.accepted_at) return this.i18n.translate(ACCEPTED_KEY);
    if (item.declined_at) {
      const declined = this.i18n.translate(DECLINED_KEY);
      return item.decline_kind
        ? `${declined} ${this.i18n.translate(`${DECLINE_KEY_PREFIX}${item.decline_kind}`)}`
        : declined;
    }
    return '';
  }

  private impedimentText(item: RaitBatchItem): string {
    return this.impediments()
      .filter((impediment) => impediment.case_id === item.case_id)
      .map((impediment) =>
        this.i18n.translate(`${IMPEDIMENT_KEY_PREFIX}${impediment.kind}`),
      )
      .join(' ');
  }
}
