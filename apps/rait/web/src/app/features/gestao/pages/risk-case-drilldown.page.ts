// T-38 Drill-down de risco (ficha IU-RAIT-040; contrato CTG-0002b §6.1 linha 38): `RadarFacade.
// loadDrilldown(caseId)` → `drilldown` (caso, relógios, alertas, atribuições, eventos);
// `RiskFlag`/`DeadlineChip` pelos relógios, `EventTimeline` do histórico; `ReassignDialog` =
// formulário `reatribuicao` (`memberId`, `releaseReason` — `field.motivo`, tokens
// `RAIT_RELEASE_REASONS`) com `Validators.required`; ações `rait-assignment:reassign`
// (`confirm.reassign`) e `rait-clock:acknowledge-alert` (papel sem fonte canônica — OD-R12-026:
// só pela chave de `RAIT_COMMAND_RULES`) sob `*stynxHasPermission` → `facade.<comando>` (M8).
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
import { StynxTranslatePipe } from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { SseService } from '../../../core/sse.service';
import { RadarFacade } from '../../../data/facades/radar.facade';
import {
  RAIT_RELEASE_REASONS,
  permissionKeyOf,
  type CommandBody,
  type RaitAssignment,
  type RaitClockAlert,
  type RaitReleaseReason,
} from '../../../data/models';
import { CaseStateBadgeComponent } from '../../../shared/case-state-badge.component';
import { ClocksPanelComponent } from '../../../shared/clocks-panel.component';
import { EventTimelineComponent } from '../../../shared/event-timeline.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import {
  CONFIRM_TITLE_KEY,
  EMPTY_KEY,
  LOADING_KEY,
  createConfirmQueue,
  provisionalBody,
} from '../../page-support';
import { routeParam } from '../../route-params';

const TITLE_KEY = 'rait.screens.gestao-radar-caseId.title';
const CMD_REASSIGN_KEY = 'rait.screens.gestao-radar-caseId.cmd.reassign';
const CMD_ACKNOWLEDGE_KEY =
  'rait.screens.gestao-radar-caseId.cmd.acknowledge-alert';
const CONFIRM_REASSIGN_KEY =
  'rait.screens.gestao-radar-caseId.confirm.reassign';
const FIELD_MOTIVE_KEY = 'rait.screens.gestao-radar-caseId.field.motivo';
const CASE_ID_PARAM = 'caseId';
const ERROR_ID_PREFIX = 'rait-drilldown-error-';

@Component({
  selector: 'rait-risk-case-drilldown-page',
  imports: [
    ReactiveFormsModule,
    StynxTranslatePipe,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    CaseStateBadgeComponent,
    ClocksPanelComponent,
    EventTimelineComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-case-id]': 'caseId',
    '[attr.data-status]': 'facade.drilldown.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />

    <rait-page-state
      [status]="facade.drilldown.status()"
      [error]="facade.drilldown.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (facade.drilldown.value(); as bundle) {
      <p data-case [attr.data-case-id]="bundle.case.id">
        <span>{{ bundle.case.protocol_number }}</span>
        <rait-case-state-badge
          [state]="bundle.case.state"
          [instance]="bundle.case.instance"
        />
      </p>
      <rait-clocks-panel [clocks]="bundle.clocks" />
      <rait-event-timeline [events]="bundle.events" />
    }

    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label for="rait-drilldown-member">member_id</label>
      <input
        id="rait-drilldown-member"
        type="text"
        formControlName="memberId"
        [attr.aria-invalid]="invalid('memberId') ? 'true' : null"
        [attr.aria-describedby]="
          invalid('memberId') ? errorId('memberId') : null
        "
      />
      @if (invalid('memberId')) {
        <p [id]="errorId('memberId')" role="alert">member_id</p>
      }
      <label for="rait-drilldown-reason">{{
        fieldMotiveKey | stynxTranslate
      }}</label>
      <select
        id="rait-drilldown-reason"
        formControlName="releaseReason"
        [attr.aria-invalid]="invalid('releaseReason') ? 'true' : null"
        [attr.aria-describedby]="
          invalid('releaseReason') ? errorId('releaseReason') : null
        "
      >
        <option value=""></option>
        @for (reason of releaseReasons; track reason) {
          <option [value]="reason" [attr.data-token]="reason">
            {{ reason }}
          </option>
        }
      </select>
      @if (invalid('releaseReason')) {
        <p [id]="errorId('releaseReason')" role="alert">
          {{ fieldMotiveKey | stynxTranslate }}
        </p>
      }
      <div class="rait-drilldown__actions">
        <button
          *stynxHasPermission="reassignPermission"
          type="button"
          data-action="reassign"
          [disabled]="offline()"
          (click)="requestReassign()"
        >
          {{ cmdReassignKey | stynxTranslate }}
        </button>
        <button
          *stynxHasPermission="acknowledgePermission"
          type="button"
          data-action="acknowledge-alert"
          [disabled]="offline() || openAlert() === null"
          (click)="acknowledge()"
        >
          {{ cmdAcknowledgeKey | stynxTranslate }}
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
export class RiskCaseDrilldownPageComponent {
  readonly facade = inject(RadarFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly caseId = routeParam(this.route, CASE_ID_PARAM);
  readonly titleKey = TITLE_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdReassignKey = CMD_REASSIGN_KEY;
  readonly cmdAcknowledgeKey = CMD_ACKNOWLEDGE_KEY;
  readonly fieldMotiveKey = FIELD_MOTIVE_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly releaseReasons = RAIT_RELEASE_REASONS;
  readonly reassignPermission = permissionKeyOf('rait-assignment:reassign');
  readonly acknowledgePermission = permissionKeyOf(
    'rait-clock:acknowledge-alert',
  );
  readonly confirm = createConfirmQueue();
  private readonly attempted = signal(false);

  /** Spec §9 "Reatribuição": novo responsável e motivo tipado obrigatórios. */
  readonly form = this.fb.group({
    memberId: this.fb.control('', Validators.required),
    releaseReason: this.fb.control<'' | RaitReleaseReason>(
      '',
      Validators.required,
    ),
  });

  readonly offline = computed(
    () => this.facade.drilldown.status() === 'offline',
  );
  /** Atribuição ativa do caso (leitura do campo `active`). */
  readonly activeAssignment = computed<RaitAssignment | null>(
    () =>
      this.facade.drilldown.value()?.assignments.find((item) => item.active) ??
      null,
  );
  /** Primeiro alerta sem reconhecimento, na ordem recebida. */
  readonly openAlert = computed<RaitClockAlert | null>(
    () =>
      this.facade.drilldown
        .value()
        ?.alerts.find(
          (alert) =>
            alert.acknowledged_at === null ||
            alert.acknowledged_at === undefined,
        ) ?? null,
  );

  constructor() {
    this.sse.connect({ caseId: this.caseId });
    void this.facade.loadDrilldown(this.caseId);
    afterRenderEffect(() => {
      const status = this.facade.drilldown.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  invalid(field: 'memberId' | 'releaseReason'): boolean {
    return this.attempted() && this.form.controls[field].invalid;
  }

  errorId(field: string): string {
    return `${ERROR_ID_PREFIX}${field}`;
  }

  /** `submit` do formulário `reatribuicao`: inválido → erros inline, nenhum comando. */
  submit(): void {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.requestReassign();
  }

  /** Confirmação `confirm.reassign` → `rait-assignment:reassign` na atribuição ativa. */
  requestReassign(): void {
    const value = this.form.getRawValue();
    const assignmentId = this.activeAssignment()?.id ?? '';
    this.confirm.request({
      action: 'reassign',
      confirmKey: CONFIRM_REASSIGN_KEY,
      labelKey: CMD_REASSIGN_KEY,
      run: () =>
        this.facade.reassign(
          assignmentId,
          provisionalBody<
            CommandBody & {
              release_reason: RaitReleaseReason;
              member_id: string;
            }
          >({
            ...(value.memberId.length > 0 ? { member_id: value.memberId } : {}),
            ...(value.releaseReason !== ''
              ? { release_reason: value.releaseReason }
              : {}),
          }),
        ),
    });
  }

  /** Reconhecimento do alerta: sem confirmação com efeito jurídico na ficha 040. */
  acknowledge(): void {
    const alert = this.openAlert();
    if (alert === null || this.offline()) return;
    void this.facade.acknowledgeClockAlert(alert.id, {});
  }

  reload(): void {
    void this.facade.loadDrilldown(this.caseId);
  }
}
