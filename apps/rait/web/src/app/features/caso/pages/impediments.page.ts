// T-14 Impedimentos e suspeições (ficha IU-RAIT-016; contrato CTG-0002b §6.1 linha 16;
// [RN-RAIT-140]; [UC-RAIT-026]): `CaseFacade.loadImpediments(id)` → `impedimentos` numa
// `<stynx-table>` do kit (kind → `rait.common.impediment_` + kind, member_id, declared_at,
// decided_by); `ImpedimentDialog` (frase do efeito jurídico `confirm.declare` da ficha §6) →
// `facade.declareImpediment` (M8); `rait-impediment:suspicion` e `rait-impediment:decide` sob
// `*stynxHasPermission` (OD-R12-026/027: botão só se a chave existir em `RAIT_COMMAND_RULES`);
// `state.awaiting-decision` quando há impedimento sem `decided_by`.
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
import { ActivatedRoute } from '@angular/router';
import {
  StynxI18nService,
  StynxIntlDatePipe,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { CaseFacade } from '../../../data/facades/case.facade';
import {
  permissionKeyOf,
  type CommandBody,
  type CreateRaitImpedimentDto,
  type RaitImpediment,
} from '../../../data/models';
import {
  ImpedimentDialogComponent,
  type ImpedimentDraft,
} from '../../../shared/impediment-dialog.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import type { TableColumn } from '../../../shared/table-column';
import {
  CONFIRM_TITLE_KEY,
  LOADING_KEY,
  combineStatus,
  createConfirmQueue,
  provisionalBody,
} from '../../page-support';
import { caseIdOf } from '../case-route';

const TITLE_KEY = 'rait.screens.casos-id-impedimentos.title';
const INTRO_KEY = 'rait.screens.casos-id-impedimentos.intro';
const EMPTY_KEY = 'rait.screens.casos-id-impedimentos.empty';
const CMD_DECLARE_KEY = 'rait.screens.casos-id-impedimentos.cmd.declare';
const CONFIRM_DECLARE_KEY =
  'rait.screens.casos-id-impedimentos.confirm.declare';
const AWAITING_DECISION_KEY =
  'rait.screens.casos-id-impedimentos.state.awaiting-decision';
const CMD_SUSPICION_KEY = 'rait.action.suspicion';
/** Ficha 016 §6 "decidir arguição": sem chave `cmd.*` própria — rótulo da semente. */
const CMD_DECIDE_KEY = 'rait.action.declare';
const IMPEDIMENT_KIND_PREFIX = 'rait.common.impediment_';
const SUSPICION_KIND: RaitImpediment['kind'] = 'suspeicao';

interface ImpedimentRow extends Record<string, unknown> {
  readonly id: string;
  readonly kind: string;
  readonly member_id: string;
  readonly declared_at: string;
  readonly decided_by: string;
}

const COLUMNS: readonly TableColumn<ImpedimentRow>[] = [
  { key: 'kind', label: 'kind' },
  { key: 'member_id', label: 'member_id' },
  { key: 'declared_at', label: 'declared_at' },
  { key: 'decided_by', label: 'decided_by' },
];

@Component({
  selector: 'rait-impediments-page',
  imports: [
    StynxTranslatePipe,
    StynxTableComponent,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    ImpedimentDialogComponent,
    RaitErrorBannerComponent,
  ],
  providers: [...provideRaitI18nFallback(), StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="status()"
      [error]="facade.caso.error() ?? facade.impedimentos.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (awaitingDecision()) {
      <p role="status" data-state="awaiting-decision">
        {{ awaitingDecisionKey | stynxTranslate }}
      </p>
    }

    @if (rows().length > 0) {
      <stynx-table
        [columns]="columns"
        [rows]="rows()"
        [rowTrackBy]="trackRow"
      />
    }

    @if (facade.caso.value()) {
      <div class="rait-impediments__actions">
        <button
          *stynxHasPermission="declarePermission"
          type="button"
          data-action="declare"
          [disabled]="offline()"
          (click)="requestDeclare()"
        >
          {{ cmdDeclareKey | stynxTranslate }}
        </button>
        <button
          *stynxHasPermission="suspicionPermission"
          type="button"
          data-action="suspicion"
          [disabled]="offline()"
          (click)="openDialog(suspicionKind)"
        >
          {{ cmdSuspicionKey | stynxTranslate }}
        </button>
        <button
          *stynxHasPermission="decidePermission"
          type="button"
          data-action="decide"
          [disabled]="offline() || pendingImpediment() === null"
          (click)="decide()"
        >
          {{ cmdDecideKey | stynxTranslate }}
        </button>
      </div>
    }

    <rait-impediment-dialog
      [(open)]="dialogOpen"
      [titleKey]="dialogTitleKey()"
      [messageKey]="confirmDeclareKey"
      (confirmed)="submitDialog($event)"
    />

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
export class ImpedimentsPageComponent {
  readonly facade = inject(CaseFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(StynxI18nService);
  private readonly datePipe = inject(StynxIntlDatePipe);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly caseId = caseIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdDeclareKey = CMD_DECLARE_KEY;
  readonly cmdSuspicionKey = CMD_SUSPICION_KEY;
  readonly cmdDecideKey = CMD_DECIDE_KEY;
  readonly confirmDeclareKey = CONFIRM_DECLARE_KEY;
  readonly awaitingDecisionKey = AWAITING_DECISION_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly suspicionKind = SUSPICION_KIND;
  readonly declarePermission = permissionKeyOf('rait-impediment:declare');
  readonly suspicionPermission = permissionKeyOf('rait-impediment:suspicion');
  readonly decidePermission = permissionKeyOf('rait-impediment:decide');
  readonly columns = COLUMNS as TableColumn<ImpedimentRow>[];
  readonly trackRow = (row: ImpedimentRow): string => row.id;
  readonly confirm = createConfirmQueue();
  readonly dialogOpen = signal(false);
  private readonly dialogKind = signal<RaitImpediment['kind'] | null>(null);
  readonly dialogTitleKey = computed(() =>
    this.dialogKind() === SUSPICION_KIND ? CMD_SUSPICION_KEY : CMD_DECLARE_KEY,
  );

  readonly status = computed(() =>
    combineStatus(this.facade.caso.status(), this.facade.impedimentos.status()),
  );
  readonly offline = computed(
    () => this.facade.impedimentos.status() === 'offline',
  );
  /** Primeira arguição sem decisão (leitura de campo, não regra). */
  readonly pendingImpediment = computed<RaitImpediment | null>(
    () =>
      this.facade.impedimentos
        .items()
        .find(
          (item) => item.decided_by === null || item.decided_by === undefined,
        ) ?? null,
  );
  readonly awaitingDecision = computed(() => this.pendingImpediment() !== null);

  readonly rows = computed<ImpedimentRow[]>(() =>
    this.facade.impedimentos.items().map((item) => ({
      id: item.id,
      kind: this.i18n.translate(`${IMPEDIMENT_KIND_PREFIX}${item.kind}`),
      member_id: item.member_id,
      declared_at: this.datePipe.transform(item.declared_at),
      decided_by: item.decided_by ?? '',
    })),
  );

  constructor() {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadImpediments(this.caseId);
    afterRenderEffect(() => {
      const status = this.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  /** `cmd.declare`: confirmação com a frase da ficha (guia §3.3) e, confirmada, o diálogo com
   * tipo/fundamento (`ImpedimentDialog`) — o comando parte só do diálogo. */
  requestDeclare(): void {
    this.confirm.request({
      action: 'declare',
      confirmKey: CONFIRM_DECLARE_KEY,
      labelKey: CMD_DECLARE_KEY,
      run: async () => this.openDialog(null),
    });
  }

  openDialog(kind: RaitImpediment['kind'] | null): void {
    this.dialogKind.set(kind);
    this.dialogOpen.set(true);
  }

  submitDialog(draft: ImpedimentDraft): void {
    const body = provisionalBody<CreateRaitImpedimentDto>({
      case_id: this.caseId,
      kind: draft.kind,
      basis: draft.basis,
      legal_basis: draft.legalBasis,
    });
    if (draft.kind === SUSPICION_KIND && this.dialogKind() === SUSPICION_KIND) {
      void this.facade.registerSuspicion(body);
      return;
    }
    void this.facade.declareImpediment(body);
  }

  /** Ficha 016 §6 "decidir arguição": o presidente decide a arguição pendente; `decided_by` é a
   * identidade do principal, que o cliente não conhece (OD-R12-021) — fica ao servidor. */
  decide(): void {
    const pending = this.pendingImpediment();
    if (pending === null || this.offline()) return;
    void this.facade.decideImpediment(
      pending.id,
      provisionalBody<CommandBody & { decided_by: string }>({}),
    );
  }

  reload(): void {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadImpediments(this.caseId);
  }
}
