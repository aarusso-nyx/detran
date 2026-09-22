// QueueTable (contrato CTG-0002b §5.16; [RN-RAIT-141]; WF-RAIT-004 §2; guia §3.1; spec §10.4
// j/k/enter): `<stynx-table>` do kit com linhas de TEXTO já traduzido (`StynxI18nService`) —
// estado por `tokenKey('caseState')`, instância por `'rait.instance.'`, risco por
// `tokenKey('riskFlag')` (+ dias só quando o servidor os manda), prazo por `tokenKey('timer')` +
// data, prioridade por `rait.common.priority`; ordem = `items` (nunca reordena; nenhuma ordenação neste arquivo).
// `StynxTableComponent` 1.3.1 não tem template de célula, seleção nem clique (OD-R12-024): a
// linha ativa é mantida aqui (`activeIndex`), anunciada em `<p role="status" aria-live="polite">`
// (`rait.common.activeRow` {index}{total}{protocol}) e materializada em `aria-current="true"` no
// `<tr>` ativo por `afterRenderEffect` — única mutação de DOM admitida (documentada). O clique na
// linha é capturado no host na fase de CAPTURA (o evento pode não borbulhar) e resolvido por
// `closest('tr').sectionRowIndex` (posição dentro do `<tbody>`). Ação principal (`primaryAction`, sob a chave de
// `RAIT_COMMAND_RULES`) e `rait.action.open` operam sobre a linha ativa; Enter/j/k são
// registrados pela PÁGINA no `ShortcutService` (`open` → `openActive`, `list-next` → `next`,
// `list-prev` → `prev`).
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  DetranEmptyStateComponent,
  DetranLoadingStateComponent,
  StynxI18nService,
  StynxIntlDatePipe,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import type { TableColumn } from './table-column';
import { tokenKey } from '../core/i18n-token-key';
import type { ReadStatus } from '../data/facades/read-store';
import {
  permissionKeyOf,
  type RaitCaseState,
  type RaitCommand,
  type RaitInstance,
  type RaitRiskFlag,
  type RaitTimerCode,
} from '../data/models';

/** View-model montado pela página a partir dos recursos gerados (não é DTO). */
export interface QueueItem {
  readonly id: string;
  readonly caseId: string;
  readonly protocol: string;
  readonly state: RaitCaseState;
  readonly instance: RaitInstance;
  readonly flag: RaitRiskFlag | null;
  /** Só do servidor (OD-R12-022). */
  readonly daysRemaining: number | null;
  readonly deadline: {
    readonly timerCode: RaitTimerCode;
    readonly dueOn: string;
    readonly legalBasis: string;
    readonly kind: 'legal' | 'operacional';
  } | null;
  readonly priority: boolean;
}

export type QueueColumnKey =
  'protocol' | 'state' | 'instance' | 'risk' | 'deadline' | 'priority';

export interface QueuePrimaryAction {
  readonly command: RaitCommand;
  readonly labelKey: string;
}

const DEFAULT_COLUMNS: readonly QueueColumnKey[] = [
  'protocol',
  'state',
  'risk',
  'deadline',
];
const INSTANCE_KEY_PREFIX = 'rait.instance.';
const DAYS_REMAINING_KEY = 'rait.common.daysRemaining';
const PRIORITY_KEY = 'rait.common.priority';
const ACTIVE_ROW_KEY = 'rait.common.activeRow';
const OPEN_KEY = 'rait.action.open';
const EMPTY_KEY = 'rait.states.empty';
const LOADING_KEY = 'rait.states.loading';
const NO_ACTIVE = -1;
const ROW_SELECTOR = 'tbody tr';

type QueueRow = Record<QueueColumnKey, string> & { readonly id: string };

@Component({
  selector: 'rait-queue-table',
  imports: [
    StynxTranslatePipe,
    StynxTableComponent,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
    StynxHasPermissionDirective,
  ],
  providers: [StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-queue-table',
    '[attr.data-active-index]': 'activeIndex()',
    '[attr.data-count]': 'items().length',
    '[attr.data-status]': 'status()',
  },
  template: `
    @if (status() === 'loading') {
      <detran-loading-state [label]="loadingKey | stynxTranslate" />
    } @else if (status() === 'empty') {
      <detran-empty-state
        [title]="emptyLabelKey() | stynxTranslate"
        [message]="emptyLabelKey() | stynxTranslate"
      />
    } @else {
      <div class="rait-queue-table__actions">
        @if (primaryAction(); as action) {
          <button
            *stynxHasPermission="permissionKeyOf(action.command)"
            type="button"
            data-primary-action
            [attr.data-command]="action.command"
            [disabled]="activeItem() === null"
            (click)="emitAction()"
          >
            {{ action.labelKey | stynxTranslate }}
          </button>
        }
        <button
          type="button"
          data-open-action
          [disabled]="activeItem() === null"
          (click)="openActive()"
        >
          {{ openKey | stynxTranslate }}
        </button>
      </div>
      <stynx-table
        [columns]="tableColumns()"
        [rows]="rows()"
        [rowTrackBy]="trackRow"
      />
      <p role="status" aria-live="polite" class="rait-queue-table__active">
        @if (activeItem(); as item) {
          {{
            activeRowKey
              | stynxTranslate
                : {
                    index: activeIndex() + 1,
                    total: items().length,
                    protocol: item.protocol,
                  }
          }}
        }
      </p>
    }
  `,
})
export class QueueTableComponent {
  private readonly i18n = inject(StynxI18nService);
  private readonly datePipe = inject(StynxIntlDatePipe);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly items = input.required<readonly QueueItem[]>();
  readonly columns = input<readonly QueueColumnKey[]>(DEFAULT_COLUMNS);
  readonly status = input<ReadStatus>('ready');
  readonly primaryAction = input<QueuePrimaryAction | null>(null);
  /** Rótulos da tela chamadora. */
  readonly columnLabelKeys =
    input.required<Readonly<Record<QueueColumnKey, string>>>();
  readonly emptyLabelKey = input<string>(EMPTY_KEY);
  readonly open = output<QueueItem>();
  readonly action = output<QueueItem>();

  readonly permissionKeyOf = permissionKeyOf;
  readonly activeRowKey = ACTIVE_ROW_KEY;
  readonly openKey = OPEN_KEY;
  readonly loadingKey = LOADING_KEY;

  private readonly activeState = signal(0);
  /** −1 sem itens. */
  readonly activeIndex = computed(() => {
    const total = this.items().length;
    if (total === 0) return NO_ACTIVE;
    return Math.min(this.activeState(), total - 1);
  });
  readonly activeItem = computed<QueueItem | null>(() => {
    const index = this.activeIndex();
    return index === NO_ACTIVE ? null : this.items()[index];
  });

  readonly tableColumns = computed<TableColumn<QueueRow>[]>(() =>
    this.columns().map((key) => ({
      key,
      label: this.i18n.translate(this.columnLabelKeys()[key]),
    })),
  );

  /** Ordem = `items` ([RN-RAIT-141]). */
  readonly rows = computed<QueueRow[]>(() =>
    this.items().map((item) => ({
      id: item.id,
      protocol: item.protocol,
      state: this.i18n.translate(tokenKey('caseState', item.state)),
      instance: this.i18n.translate(`${INSTANCE_KEY_PREFIX}${item.instance}`),
      risk: this.riskText(item),
      deadline: this.deadlineText(item),
      priority: item.priority ? this.i18n.translate(PRIORITY_KEY) : '',
    })),
  );

  readonly trackRow = (row: QueueRow): string => row.id;

  constructor() {
    const onClick = (event: Event): void => this.onHostClick(event);
    this.host.nativeElement.addEventListener('click', onClick, {
      capture: true,
    });
    inject(DestroyRef).onDestroy(() =>
      this.host.nativeElement.removeEventListener('click', onClick, {
        capture: true,
      }),
    );
    // Única mutação de DOM: sincroniza `aria-current` no <tr> ativo do kit (OD-R12-024).
    afterRenderEffect(() => {
      const active = this.activeIndex();
      this.rows();
      const rows = this.host.nativeElement.querySelectorAll(ROW_SELECTOR);
      rows.forEach((row, index) => {
        if (index === active) row.setAttribute('aria-current', 'true');
        else row.removeAttribute('aria-current');
      });
    });
  }

  next(): void {
    const total = this.items().length;
    if (total === 0) return;
    this.activeState.set(Math.min(this.activeIndex() + 1, total - 1));
  }

  prev(): void {
    if (this.items().length === 0) return;
    this.activeState.set(Math.max(this.activeIndex() - 1, 0));
  }

  openActive(): void {
    const item = this.activeItem();
    if (item !== null) this.open.emit(item);
  }

  emitAction(): void {
    const item = this.activeItem();
    if (item !== null) this.action.emit(item);
  }

  private onHostClick(event: Event): void {
    const target = event.target as Element | null;
    const row = target?.closest?.('tr') ?? null;
    if (
      !(row instanceof HTMLTableRowElement) ||
      row.parentElement?.tagName !== 'TBODY'
    ) {
      return;
    }
    const index = row.sectionRowIndex;
    if (index >= 0 && index < this.items().length) this.activeState.set(index);
  }

  private riskText(item: QueueItem): string {
    if (item.flag === null) return '';
    const label = this.i18n.translate(tokenKey('riskFlag', item.flag));
    if (item.daysRemaining === null) return label;
    const days = this.i18n.translate(DAYS_REMAINING_KEY, {
      count: item.daysRemaining,
    });
    return `${label} ${days}`;
  }

  private deadlineText(item: QueueItem): string {
    if (item.deadline === null) return '';
    const label = this.i18n.translate(
      tokenKey('timer', item.deadline.timerCode),
    );
    return `${label} ${this.datePipe.transform(item.deadline.dueOn)}`;
  }
}
