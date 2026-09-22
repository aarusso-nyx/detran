// T-30 Banca e presenças (ficha IU-RAIT-035; contrato CTG-0002b §6.1 linha 34; [RN-RAIT-142]):
// `SessionFacade.loadSession(id)` → `sessao` (banca, presenças) e `loadSubstituteDuties(id)` →
// `suplentes`; `QuorumIndicator`; `<stynx-table>` de presenças (member_id, present,
// membership_kind, representation_block); formulário mínimo (`memberId`, `present`); ações
// `rait-attendance:confirm` (`confirm.confirm`) e `rait-attendance:summon-substitute`
// (`confirm.summon_substitute`) sob `*stynxHasPermission` (chaves só de ficha — OD-R12-027,
// fail-closed) → `facade.<comando>` (M8); `state.insufficient` = `bench.state ===
// 'BANCA_INSUFICIENTE'` (token do servidor; nenhuma comparação de quorum no cliente).
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
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  StynxI18nService,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { SseService } from '../../../core/sse.service';
import { SessionFacade } from '../../../data/facades/session.facade';
import {
  permissionKeyOf,
  type CreateRaitAttendanceDto,
  type CreateRaitSubstituteDutyDto,
  type RaitBenchState,
} from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import { QuorumIndicatorComponent } from '../../../shared/quorum-indicator.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import type { TableColumn } from '../../../shared/table-column';
import {
  CONFIRM_TITLE_KEY,
  EMPTY_KEY,
  LOADING_KEY,
  createConfirmQueue,
  provisionalBody,
} from '../../page-support';
import { sessionIdOf } from '../colegiado-route';

const TITLE_KEY = 'rait.screens.colegiado-orgao-sessoes-id-banca.title';
const INTRO_KEY = 'rait.screens.colegiado-orgao-sessoes-id-banca.intro';
const CMD_CONFIRM_KEY =
  'rait.screens.colegiado-orgao-sessoes-id-banca.cmd.confirm';
const CMD_SUMMON_KEY =
  'rait.screens.colegiado-orgao-sessoes-id-banca.cmd.summon_substitute';
const CONFIRM_CONFIRM_KEY =
  'rait.screens.colegiado-orgao-sessoes-id-banca.confirm.confirm';
const CONFIRM_SUMMON_KEY =
  'rait.screens.colegiado-orgao-sessoes-id-banca.confirm.summon_substitute';
const INSUFFICIENT_KEY =
  'rait.screens.colegiado-orgao-sessoes-id-banca.state.insufficient';
const YES_KEY = 'rait.common.yes';
const NO_KEY = 'rait.common.no';
const INSUFFICIENT_BENCH: RaitBenchState = 'BANCA_INSUFICIENTE';
const MEMBER_ERROR_ID = 'rait-bench-member-error';

interface AttendanceRow extends Record<string, unknown> {
  readonly id: string;
  readonly member_id: string;
  readonly present: string;
  readonly membership_kind: string;
  readonly representation_block: string;
}

const COLUMNS: readonly TableColumn<AttendanceRow>[] = [
  { key: 'member_id', label: 'member_id' },
  { key: 'present', label: 'present' },
  { key: 'membership_kind', label: 'membership_kind' },
  { key: 'representation_block', label: 'representation_block' },
];

@Component({
  selector: 'rait-bench-page',
  imports: [
    ReactiveFormsModule,
    StynxTranslatePipe,
    StynxTableComponent,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    QuorumIndicatorComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-session-id]': 'sessionId',
    '[attr.data-status]': 'facade.sessao.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="facade.sessao.status()"
      [error]="facade.sessao.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (insufficient()) {
      <p role="status" data-state="insufficient">
        {{ insufficientKey | stynxTranslate }}
      </p>
    }

    @if (facade.sessao.value(); as bundle) {
      <rait-quorum-indicator
        [session]="bundle.session"
        [bench]="bundle.bench"
        [attendance]="bundle.attendance"
      />
      @if (rows().length > 0) {
        <stynx-table
          [columns]="columns"
          [rows]="rows()"
          [rowTrackBy]="trackRow"
        />
      }
    }

    <form [formGroup]="form" (ngSubmit)="requestConfirm()" novalidate>
      <label for="rait-bench-member">member_id</label>
      <input
        id="rait-bench-member"
        type="text"
        formControlName="memberId"
        [attr.aria-invalid]="memberInvalid() ? 'true' : null"
        [attr.aria-describedby]="memberInvalid() ? memberErrorId : null"
      />
      @if (memberInvalid()) {
        <p [id]="memberErrorId" role="alert">member_id</p>
      }
      <label>
        <input type="checkbox" formControlName="present" />
        present
      </label>
      <div class="rait-bench__actions">
        <button
          *stynxHasPermission="confirmPermission"
          type="button"
          data-action="confirm"
          [disabled]="offline()"
          (click)="requestConfirm()"
        >
          {{ cmdConfirmKey | stynxTranslate }}
        </button>
        <button
          *stynxHasPermission="summonPermission"
          type="button"
          data-action="summon-substitute"
          [disabled]="offline()"
          (click)="requestSummon()"
        >
          {{ cmdSummonKey | stynxTranslate }}
        </button>
      </div>
    </form>

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
export class BenchPageComponent {
  readonly facade = inject(SessionFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly i18n = inject(StynxI18nService);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly sessionId = sessionIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdConfirmKey = CMD_CONFIRM_KEY;
  readonly cmdSummonKey = CMD_SUMMON_KEY;
  readonly insufficientKey = INSUFFICIENT_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly memberErrorId = MEMBER_ERROR_ID;
  readonly columns = COLUMNS as TableColumn<AttendanceRow>[];
  readonly trackRow = (row: AttendanceRow): string => row.id;
  readonly confirmPermission = permissionKeyOf('rait-attendance:confirm');
  readonly summonPermission = permissionKeyOf(
    'rait-attendance:summon-substitute',
  );
  readonly confirm = createConfirmQueue();
  private readonly attempted = signal(false);

  readonly form = this.fb.group({
    memberId: this.fb.control('', Validators.required),
    present: this.fb.control(false),
  });
  readonly memberInvalid = computed(
    () => this.attempted() && this.form.controls.memberId.invalid,
  );

  readonly offline = computed(() => this.facade.sessao.status() === 'offline');
  readonly insufficient = computed(
    () => this.facade.sessao.value()?.bench?.state === INSUFFICIENT_BENCH,
  );
  readonly rows = computed<AttendanceRow[]>(() =>
    (this.facade.sessao.value()?.attendance ?? []).map((entry) => ({
      id: entry.id,
      member_id: entry.member_id,
      present: this.i18n.translate(entry.present ? YES_KEY : NO_KEY),
      membership_kind: entry.membership_kind ?? '',
      representation_block: entry.representation_block ?? '',
    })),
  );

  constructor() {
    this.sse.connect({ sessionId: this.sessionId });
    void this.facade.loadSession(this.sessionId);
    void this.facade.loadSubstituteDuties(this.sessionId);
    afterRenderEffect(() => {
      const status = this.facade.sessao.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  requestConfirm(): void {
    this.attempted.set(true);
    const value = this.form.getRawValue();
    this.confirm.request({
      action: 'confirm',
      confirmKey: CONFIRM_CONFIRM_KEY,
      labelKey: CMD_CONFIRM_KEY,
      run: () =>
        this.facade.confirmAttendance(
          provisionalBody<CreateRaitAttendanceDto>({
            session_id: this.sessionId,
            ...(value.memberId.length > 0 ? { member_id: value.memberId } : {}),
            present: value.present,
          }),
        ),
    });
  }

  requestSummon(): void {
    const value = this.form.getRawValue();
    this.confirm.request({
      action: 'summon-substitute',
      confirmKey: CONFIRM_SUMMON_KEY,
      labelKey: CMD_SUMMON_KEY,
      run: () =>
        this.facade.summonSubstitute(
          provisionalBody<CreateRaitSubstituteDutyDto>({
            session_id: this.sessionId,
            ...(value.memberId.length > 0 ? { member_id: value.memberId } : {}),
          }),
        ),
    });
  }

  reload(): void {
    void this.facade.loadSession(this.sessionId);
    void this.facade.loadSubstituteDuties(this.sessionId);
  }
}
