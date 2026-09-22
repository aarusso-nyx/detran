// T-25 Relatoria (ficha IU-RAIT-030; contrato CTG-0002b §6.1 linha 29; [RN-RAIT-140]): `SessionFacade.
// loadRapporteurItems(orgao)` → `relatoria` (itens de lote do órgão — sem recorte "member=me",
// OD-R12-021) numa `<stynx-table>` do kit (position, case_id, claim_due_on com o rótulo do timer
// `T-CLAIM`, accepted_at); a facade não compõe os casos dos itens (§6.1 "(+ casos)"), então a
// `QueueTable` de casos fica para essa composição (relatório TASK-0015). Ações `rait-batch:accept`
// (`confirm.accept`) e `rait-batch:impede` (`confirm.impede`, tipo `decline_kind` do contrato) sob
// `*stynxHasPermission` (M4) sobre o item selecionado → `facade.<comando>` (M8); abrir →
// `…/relatoria/:caseId/voto`. Lista sincronizada com a URL.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  StynxI18nService,
  StynxIntlDatePipe,
  StynxPaginationComponent,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { tokenKey } from '../../../core/i18n-token-key';
import { SseService } from '../../../core/sse.service';
import { SessionFacade } from '../../../data/facades/session.facade';
import {
  RAIT_IMPEDIMENT_KINDS,
  permissionKeyOf,
  type ListQuery,
  type RaitBatchItem,
  type RaitDeclineKind,
  type RaitJudgingBody,
} from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import type { TableColumn } from '../../../shared/table-column';
import {
  connectListToUrl,
  hasListQuery,
  mergeListQuery,
} from '../../list-url-sync';
import {
  CONFIRM_TITLE_KEY,
  LOADING_KEY,
  createConfirmQueue,
} from '../../page-support';
import { judgingBodyOf } from '../colegiado-route';

const TITLE_KEY = 'rait.screens.colegiado-orgao-relatoria.title';
const INTRO_KEY = 'rait.screens.colegiado-orgao-relatoria.intro';
const EMPTY_KEY = 'rait.screens.colegiado-orgao-relatoria.empty';
const CMD_ACCEPT_KEY = 'rait.screens.colegiado-orgao-relatoria.cmd.accept';
const CMD_IMPEDE_KEY = 'rait.screens.colegiado-orgao-relatoria.cmd.impede';
const CONFIRM_ACCEPT_KEY =
  'rait.screens.colegiado-orgao-relatoria.confirm.accept';
const CONFIRM_IMPEDE_KEY =
  'rait.screens.colegiado-orgao-relatoria.confirm.impede';
const IMPEDIMENT_KIND_PREFIX = 'rait.common.impediment_';
const CLAIM_TIMER = 'T-CLAIM';
const COLEGIADO_ROUTE = '/colegiado';
const RAPPORTEUR_ROUTE = 'relatoria';
const OPINION_ROUTE = 'voto';

interface ItemRow extends Record<string, unknown> {
  readonly id: string;
  readonly position: string;
  readonly case_id: string;
  readonly claim_due_on: string;
  readonly accepted_at: string;
}

const COLUMNS: readonly TableColumn<ItemRow>[] = [
  { key: 'position', label: 'position' },
  { key: 'case_id', label: 'case_id' },
  { key: 'claim_due_on', label: 'claim_due_on' },
  { key: 'accepted_at', label: 'accepted_at' },
];

@Component({
  selector: 'rait-rapporteur-cases-page',
  imports: [
    StynxTranslatePipe,
    StynxTableComponent,
    StynxPaginationComponent,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    RaitErrorBannerComponent,
  ],
  providers: [...provideRaitI18nFallback(), StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-orgao]': 'orgao',
    '[attr.data-status]': 'facade.relatoria.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="facade.relatoria.status()"
      [error]="facade.relatoria.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (rows().length > 0) {
      <stynx-table
        [columns]="columns"
        [rows]="rows()"
        [rowTrackBy]="trackRow"
      />
      <label for="rait-relatoria-item">case_id</label>
      <select id="rait-relatoria-item" (change)="selectItem($event)">
        <option value=""></option>
        @for (item of facade.relatoria.items(); track item.id) {
          <option [value]="item.id" [selected]="item.id === selectedId()">
            {{ item.case_id }}
          </option>
        }
      </select>
    }
    @if (facade.relatoria.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }

    <div class="rait-rapporteur-cases__actions">
      <button
        type="button"
        data-open-opinion
        [disabled]="selected() === null"
        (click)="openOpinion()"
      >
        {{ openKey | stynxTranslate }}
      </button>
      <button
        *stynxHasPermission="acceptPermission"
        type="button"
        data-action="accept"
        [disabled]="offline() || selected() === null"
        (click)="requestAccept()"
      >
        {{ cmdAcceptKey | stynxTranslate }}
      </button>
      <label for="rait-relatoria-decline-kind">decline_kind</label>
      <select
        id="rait-relatoria-decline-kind"
        (change)="selectDeclineKind($event)"
      >
        @for (kind of declineKinds; track kind) {
          <option [value]="kind" [attr.data-token]="kind">
            {{ impedimentKindPrefix + kind | stynxTranslate }}
          </option>
        }
      </select>
      <button
        *stynxHasPermission="impedePermission"
        type="button"
        data-action="impede"
        [disabled]="offline() || selected() === null"
        (click)="requestImpede()"
      >
        {{ cmdImpedeKey | stynxTranslate }}
      </button>
    </div>

    <stynx-confirm-dialog
      [open]="confirm.open()"
      [title]="confirmTitleKey | stynxTranslate"
      [message]="confirm.pending()?.confirmKey ?? '' | stynxTranslate"
      [confirmLabel]="confirm.pending()?.labelKey ?? '' | stynxTranslate"
      (confirm)="confirm.confirm()"
      (dismissed)="confirm.dismiss()"
    />
  `,
})
export class RapporteurCasesPageComponent {
  readonly facade = inject(SessionFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly i18n = inject(StynxI18nService);
  private readonly datePipe = inject(StynxIntlDatePipe);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly orgao: RaitJudgingBody = judgingBodyOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdAcceptKey = CMD_ACCEPT_KEY;
  readonly cmdImpedeKey = CMD_IMPEDE_KEY;
  readonly openKey = 'rait.action.open';
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly impedimentKindPrefix = IMPEDIMENT_KIND_PREFIX;
  /** `decline_kind` do contrato = tipos de impedimento (`RAIT_IMPEDIMENT_KINDS`). */
  readonly declineKinds: readonly RaitDeclineKind[] = RAIT_IMPEDIMENT_KINDS;
  readonly columns = COLUMNS as TableColumn<ItemRow>[];
  readonly trackRow = (row: ItemRow): string => row.id;
  readonly acceptPermission = permissionKeyOf('rait-batch:accept');
  readonly impedePermission = permissionKeyOf('rait-batch:impede');
  readonly confirm = createConfirmQueue();
  readonly selectedId = signal('');
  private readonly declineKind = signal<RaitDeclineKind>(
    RAIT_IMPEDIMENT_KINDS[0],
  );

  readonly list = connectListToUrl({ load: (query) => this.load(query) });
  readonly offline = computed(
    () => this.facade.relatoria.status() === 'offline',
  );
  readonly selected = computed<RaitBatchItem | null>(
    () =>
      this.facade.relatoria
        .items()
        .find((item) => item.id === this.selectedId()) ?? null,
  );
  readonly rows = computed<ItemRow[]>(() =>
    this.facade.relatoria.items().map((item) => ({
      id: item.id,
      position: String(item.position),
      case_id: item.case_id,
      claim_due_on: item.claim_due_on
        ? `${this.i18n.translate(tokenKey('timer', CLAIM_TIMER))} ${this.datePipe.transform(item.claim_due_on)}`
        : '',
      accepted_at: item.accepted_at
        ? this.datePipe.transform(item.accepted_at)
        : '',
    })),
  );

  constructor() {
    this.sse.connect();
    afterRenderEffect(() => {
      const status = this.facade.relatoria.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  selectItem(event: Event): void {
    this.selectedId.set((event.target as HTMLSelectElement).value);
  }

  selectDeclineKind(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const kind = RAIT_IMPEDIMENT_KINDS.find((token) => token === value);
    if (kind !== undefined) this.declineKind.set(kind);
  }

  requestAccept(): void {
    const item = this.selected();
    this.confirm.request({
      action: 'accept',
      confirmKey: CONFIRM_ACCEPT_KEY,
      labelKey: CMD_ACCEPT_KEY,
      run: () =>
        this.facade.acceptBatchItem(
          item?.batch_id ?? '',
          item?.case_id ?? '',
          {},
        ),
    });
  }

  requestImpede(): void {
    const item = this.selected();
    const declineKind = this.declineKind();
    this.confirm.request({
      action: 'impede',
      confirmKey: CONFIRM_IMPEDE_KEY,
      labelKey: CMD_IMPEDE_KEY,
      run: () =>
        this.facade.impedeBatchItem(item?.batch_id ?? '', item?.case_id ?? '', {
          decline_kind: declineKind,
        }),
    });
  }

  openOpinion(): void {
    const item = this.selected();
    if (item === null) return;
    void this.router.navigate([
      COLEGIADO_ROUTE,
      this.orgao,
      RAPPORTEUR_ROUTE,
      item.case_id,
      OPINION_ROUTE,
    ]);
  }

  reload(): void {
    void this.load(this.list.query());
  }

  /** `loadRapporteurItems(orgao)` não recebe consulta (§4.3): a da URL entra por `setQuery`. */
  private async load(query: ListQuery): Promise<void> {
    await this.facade.loadRapporteurItems(this.orgao);
    if (hasListQuery(query)) {
      await this.facade.relatoria.setQuery(
        mergeListQuery(this.facade.relatoria.query(), query),
      );
    }
  }
}
