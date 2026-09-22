// T-03 Triagem de admissibilidade (ficha IU-RAIT-008; contrato CTG-0002b §6.1 linha 8; [RN-RAIT-001];
// [RN-RAIT-122]): `CaseFacade.loadAdmissibility(id)` → `admissibilidade`; `prazos` (a
// tempestividade vem do registro `criterion: 'tempestividade'` do servidor — somente leitura no
// `AdmissibilityChecklist`, [RN-RAIT-005]). Formulário `triagem` (forma mínima; schema zod no
// CTG-0002c): vereditos de legitimidade/assinatura/pedido pelo checklist (`model verdicts`) e
// `non_admission_reason` (obrigatório só em `reject`). Ações sob `*stynxHasPermission` (M4):
// `rait-case:triage` (salvar checklist, sem efeito jurídico), `rait-case:admit` e
// `rait-case:reject` com confirmação da ficha §6 (guia §3.3) antes de `facade.<comando>` (M8 →
// `rait-error-banner` `unavailable`). Rótulos do inciso de não conhecimento: sem chave própria no
// catálogo — usa o rótulo do critério correspondente (OD proposta em TASK-0015); o token vai em
// `value`/`data-token`.
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
import { CaseFacade } from '../../../data/facades/case.facade';
import {
  permissionKeyOf,
  type CreateRaitAdmissibilityDto,
  type RaitAdmissibilityCriterion,
  type RaitNonAdmissionReason,
} from '../../../data/models';
import {
  AdmissibilityChecklistComponent,
  EMPTY_VERDICTS,
  type AdmissibilityVerdicts,
  type EditableCriterion,
} from '../../../shared/admissibility-checklist.component';
import { DeadlineChipComponent } from '../../../shared/deadline-chip.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import {
  CONFIRM_TITLE_KEY,
  EMPTY_KEY,
  LOADING_KEY,
  combineStatus,
  createConfirmQueue,
  provisionalBody,
} from '../../page-support';
import { caseIdOf } from '../case-route';
import { deadlineKindOf } from '../deadline-kind';

const SLUG = 'rait.screens.casos-id-triagem';
const TITLE_KEY = `${SLUG}.title`;
const INTRO_KEY = `${SLUG}.intro`;
const CMD_ADMIT_KEY = 'rait.screens.casos-id-triagem.cmd.admit';
const CMD_REJECT_KEY = 'rait.screens.casos-id-triagem.cmd.reject';
const CONFIRM_ADMIT_KEY = 'rait.screens.casos-id-triagem.confirm.admit';
const CONFIRM_REJECT_KEY = 'rait.screens.casos-id-triagem.confirm.reject';
const CMD_TRIAGE_KEY = 'rait.action.triage';
/** Rótulos dos critérios (ficha 008 "Chaves i18n"); `tempestividade` é somente leitura. */
const FIELD_LABEL_KEYS: Readonly<Record<RaitAdmissibilityCriterion, string>> = {
  tempestividade: 'rait.screens.casos-id-triagem.field.tempestividade',
  legitimidade: 'rait.screens.casos-id-triagem.field.legitimidade',
  assinatura: 'rait.screens.casos-id-triagem.field.assinatura',
  pedido_compativel: 'rait.screens.casos-id-triagem.field.pedido',
};
/** Inciso do art. 4º da Res. 900 → critério cuja falha ele descreve (rótulo existente). */
const NON_ADMISSION_REASONS: readonly {
  readonly token: RaitNonAdmissionReason;
  readonly labelKey: string;
}[] = [
  { token: 'intempestivo', labelKey: FIELD_LABEL_KEYS.tempestividade },
  { token: 'ilegitimo', labelKey: FIELD_LABEL_KEYS.legitimidade },
  { token: 'sem_assinatura', labelKey: FIELD_LABEL_KEYS.assinatura },
  {
    token: 'pedido_incompativel',
    labelKey: FIELD_LABEL_KEYS.pedido_compativel,
  },
];
const EDITABLE_CRITERIA: readonly EditableCriterion[] = [
  'legitimidade',
  'assinatura',
  'pedido_compativel',
];
const REASON_ERROR_ID = 'rait-triage-reason-error';
/** Catálogo de erros §3 (`RAIT.NON_ADMISSION_REASON_REQUIRED`): texto do erro de forma inline. */
const REASON_REQUIRED_KEY = 'rait.errors.non_admission_reason_required';

@Component({
  selector: 'rait-triage-page',
  imports: [
    ReactiveFormsModule,
    StynxTranslatePipe,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    AdmissibilityChecklistComponent,
    DeadlineChipComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
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
      [error]="facade.caso.error() ?? facade.admissibilidade.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (facade.prazos.items().length > 0) {
      <ul class="rait-triage__deadlines">
        @for (deadline of facade.prazos.items(); track deadline.id) {
          <li>
            <rait-deadline-chip
              [timerCode]="deadline.timer_code"
              [dueOn]="deadline.due_on"
              [legalBasis]="deadline.legal_basis"
              [kind]="kindOf(deadline.timer_code)"
            />
          </li>
        }
      </ul>
    }

    @if (facade.caso.value()) {
      <form [formGroup]="form" (ngSubmit)="saveChecklist()" novalidate>
        <rait-admissibility-checklist
          [recorded]="facade.admissibilidade.items()"
          [fieldLabelKeys]="fieldLabelKeys"
          [disabled]="offline()"
          [(verdicts)]="verdicts"
        />
        <div class="rait-triage__reason">
          <label for="rait-triage-reason">
            {{ cmdRejectKey | stynxTranslate }}
          </label>
          <select
            id="rait-triage-reason"
            formControlName="nonAdmissionReason"
            [attr.aria-invalid]="reasonInvalid() ? 'true' : null"
            [attr.aria-describedby]="reasonInvalid() ? reasonErrorId : null"
          >
            <option value=""></option>
            @for (reason of reasons; track reason.token) {
              <option [value]="reason.token" [attr.data-token]="reason.token">
                {{ reason.labelKey | stynxTranslate }}
              </option>
            }
          </select>
          @if (reasonInvalid()) {
            <p [id]="reasonErrorId" role="alert">
              {{ reasonRequiredKey | stynxTranslate }}
            </p>
          }
        </div>
        <div class="rait-triage__actions">
          <button
            *stynxHasPermission="triagePermission"
            type="submit"
            data-action="triage"
            [disabled]="offline()"
          >
            {{ cmdTriageKey | stynxTranslate }}
          </button>
          <button
            *stynxHasPermission="admitPermission"
            type="button"
            data-action="admit"
            [disabled]="offline()"
            (click)="requestAdmit()"
          >
            {{ cmdAdmitKey | stynxTranslate }}
          </button>
          <button
            *stynxHasPermission="rejectPermission"
            type="button"
            data-action="reject"
            [disabled]="offline()"
            (click)="requestReject()"
          >
            {{ cmdRejectKey | stynxTranslate }}
          </button>
        </div>
      </form>
    }

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
export class TriagePageComponent {
  readonly facade = inject(CaseFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly caseId = caseIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdTriageKey = CMD_TRIAGE_KEY;
  readonly cmdAdmitKey = CMD_ADMIT_KEY;
  readonly cmdRejectKey = CMD_REJECT_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly fieldLabelKeys = FIELD_LABEL_KEYS;
  readonly reasons = NON_ADMISSION_REASONS;
  readonly reasonErrorId = REASON_ERROR_ID;
  readonly reasonRequiredKey = REASON_REQUIRED_KEY;
  readonly triagePermission = permissionKeyOf('rait-case:triage');
  readonly admitPermission = permissionKeyOf('rait-case:admit');
  readonly rejectPermission = permissionKeyOf('rait-case:reject');
  readonly kindOf = deadlineKindOf;
  readonly confirm = createConfirmQueue();
  readonly verdicts = signal<AdmissibilityVerdicts>(EMPTY_VERDICTS);

  readonly form = this.fb.group({
    nonAdmissionReason: this.fb.control<'' | RaitNonAdmissionReason>(''),
  });
  private readonly rejectAttempted = signal(false);
  readonly reasonInvalid = computed(
    () => this.rejectAttempted() && this.reasonMissing(),
  );

  readonly status = computed(() =>
    combineStatus(
      this.facade.caso.status(),
      this.facade.admissibilidade.status(),
    ),
  );
  /** Spec §8: botões de comando desabilitados enquanto `offline`. */
  readonly offline = computed(
    () =>
      this.facade.caso.status() === 'offline' ||
      this.facade.admissibilidade.status() === 'offline',
  );

  constructor() {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadAdmissibility(this.caseId);
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

  /** `rait-case:triage`: registra o checklist (sem efeito jurídico) — só com os 3 vereditos. */
  saveChecklist(): void {
    const verdicts = this.verdicts();
    const complete = EDITABLE_CRITERIA.every(
      (criterion) => verdicts[criterion].verdict !== null,
    );
    if (!complete || this.offline()) return;
    void this.facade.triage(this.caseId, this.checklistBody(verdicts));
  }

  requestAdmit(): void {
    this.confirm.request({
      action: 'admit',
      confirmKey: CONFIRM_ADMIT_KEY,
      labelKey: CMD_ADMIT_KEY,
      run: () => this.facade.admit(this.caseId, {}),
    });
  }

  /** `non_admission_reason` é obrigatório só aqui (§6.1 linha 8). */
  requestReject(): void {
    this.rejectAttempted.set(true);
    this.form.controls.nonAdmissionReason.setValidators(Validators.required);
    this.form.controls.nonAdmissionReason.updateValueAndValidity();
    if (this.reasonMissing()) return;
    const reason = this.form.controls.nonAdmissionReason.value;
    if (reason === '') return;
    this.confirm.request({
      action: 'reject',
      confirmKey: CONFIRM_REJECT_KEY,
      labelKey: CMD_REJECT_KEY,
      run: () =>
        this.facade.reject(this.caseId, { non_admission_reason: reason }),
    });
  }

  reload(): void {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadAdmissibility(this.caseId);
  }

  private reasonMissing(): boolean {
    return this.form.controls.nonAdmissionReason.value === '';
  }

  /** Só os critérios editáveis; `tempestividade` é do servidor ([RN-RAIT-005]). */
  private checklistBody(
    verdicts: AdmissibilityVerdicts,
  ): CreateRaitAdmissibilityDto[] {
    return EDITABLE_CRITERIA.map((criterion) =>
      provisionalBody<CreateRaitAdmissibilityDto>({
        case_id: this.caseId,
        criterion,
        verdict: verdicts[criterion].verdict === true,
        reason: verdicts[criterion].reason || null,
      }),
    );
  }
}
