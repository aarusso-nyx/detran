// T-08 Diligências (ficha IU-RAIT-010; contrato CTG-0002b §6.1 linha 10; [RN-RAIT-004];
// [UC-RAIT-003]): `CaseFacade.loadInquiries(id)` → `diligencias` (um `InquiryCard` por
// diligência, com o `RaitDeadline` T-DIL do caso quando `prazos` o trouxer); `InquiryForm`
// (formulário `diligencia`: `addressee`, `subject`, `dueOn?` — o prazo default é do backend,
// nunca digitado); ações sob `*stynxHasPermission` (M4): `rait-case:open-inquiry` com
// confirmação `confirm.open` (guia §3.3), `rait-case:answer` (sem confirmação na ficha) e
// `rait-case:extend` com `confirm.extend`, emitidas pelo `InquiryCard` → `facade.<comando>` (M8).
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { CaseFacade } from '../../../data/facades/case.facade';
import {
  permissionKeyOf,
  type CreateRaitInquiryDto,
  type RaitDeadline,
} from '../../../data/models';
import { InquiryCardComponent } from '../../../shared/inquiry-card.component';
import {
  InquiryFormComponent,
  type InquiryDraft,
} from '../../../shared/inquiry-form.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import {
  CONFIRM_TITLE_KEY,
  LOADING_KEY,
  combineStatus,
  createConfirmQueue,
  provisionalBody,
} from '../../page-support';
import { caseIdOf } from '../case-route';

const TITLE_KEY = 'rait.screens.casos-id-diligencias.title';
const INTRO_KEY = 'rait.screens.casos-id-diligencias.intro';
const EMPTY_KEY = 'rait.screens.casos-id-diligencias.empty';
const CMD_OPEN_KEY = 'rait.screens.casos-id-diligencias.cmd.open';
const CMD_ANSWER_KEY = 'rait.screens.casos-id-diligencias.cmd.answer';
const CMD_EXTEND_KEY = 'rait.screens.casos-id-diligencias.cmd.extend';
const CONFIRM_OPEN_KEY = 'rait.screens.casos-id-diligencias.confirm.open';
const CONFIRM_EXTEND_KEY = 'rait.screens.casos-id-diligencias.confirm.extend';
/** Timer operacional da diligência (ficha 010; §6.1 linha 13). */
const INQUIRY_TIMER = 'T-DIL';

@Component({
  selector: 'rait-inquiries-page',
  imports: [
    StynxTranslatePipe,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    InquiryFormComponent,
    InquiryCardComponent,
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
      [error]="facade.caso.error() ?? facade.diligencias.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (facade.caso.value()) {
      <section *stynxHasPermission="openPermission" data-open-inquiry>
        <h2>{{ cmdOpenKey | stynxTranslate }}</h2>
        <rait-inquiry-form
          [disabled]="offline()"
          (submitted)="requestOpen($event)"
        />
        <button
          type="button"
          data-action="open"
          [disabled]="offline() || !formComplete()"
          (click)="requestOpenFromForm()"
        >
          {{ cmdOpenKey | stynxTranslate }}
        </button>
      </section>

      @if (facade.diligencias.items().length > 0) {
        <ul class="rait-inquiries__list">
          @for (inquiry of facade.diligencias.items(); track inquiry.id) {
            <li>
              <rait-inquiry-card
                [inquiry]="inquiry"
                [deadline]="inquiryDeadline()"
                [disabled]="offline()"
                (answer)="answer($event)"
                (extend)="requestExtend($event)"
              />
            </li>
          }
        </ul>
      }
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
export class InquiriesPageComponent {
  readonly facade = inject(CaseFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly inquiryForm = viewChild(InquiryFormComponent);
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly caseId = caseIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdOpenKey = CMD_OPEN_KEY;
  readonly cmdAnswerKey = CMD_ANSWER_KEY;
  readonly cmdExtendKey = CMD_EXTEND_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly openPermission = permissionKeyOf('rait-case:open-inquiry');
  readonly confirm = createConfirmQueue();

  readonly status = computed(() =>
    combineStatus(this.facade.caso.status(), this.facade.diligencias.status()),
  );
  readonly offline = computed(
    () => this.facade.diligencias.status() === 'offline',
  );
  /** T-DIL do caso quando `prazos` o trouxer (só do servidor, [RN-RAIT-005]). */
  readonly inquiryDeadline = computed<RaitDeadline | null>(
    () =>
      this.facade.prazos
        .items()
        .find((deadline) => deadline.timer_code === INQUIRY_TIMER) ?? null,
  );
  /** Forma mínima do `InquiryForm`: destinatário e assunto. */
  readonly formComplete = computed(() => {
    const form = this.inquiryForm();
    return (
      form !== undefined &&
      form.addressee() !== null &&
      form.subject().trim().length > 0
    );
  });

  constructor() {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadInquiries(this.caseId);
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

  /** Submissão válida do `InquiryForm` → confirmação `confirm.open`. */
  requestOpen(draft: InquiryDraft): void {
    this.requestOpenWith({
      addressee: draft.addressee,
      subject: draft.subject,
      ...(draft.dueOn !== null ? { due_on: draft.dueOn } : {}),
    });
  }

  /** Botão `cmd.open` da ficha: conteúdo atual do formulário (desabilitado se incompleto);
   * campos ausentes não são preenchidos com valor algum. */
  requestOpenFromForm(): void {
    const form = this.inquiryForm();
    const addressee = form?.addressee() ?? null;
    const subject = form?.subject().trim() ?? '';
    const dueOn = form?.dueOn() ?? null;
    this.requestOpenWith({
      ...(addressee !== null ? { addressee } : {}),
      ...(subject.length > 0 ? { subject } : {}),
      ...(dueOn !== null ? { due_on: dueOn } : {}),
    });
  }

  private requestOpenWith(fields: Partial<CreateRaitInquiryDto>): void {
    this.confirm.request({
      action: 'open',
      confirmKey: CONFIRM_OPEN_KEY,
      labelKey: CMD_OPEN_KEY,
      run: () =>
        this.facade.openInquiry(
          this.caseId,
          provisionalBody<CreateRaitInquiryDto>({
            case_id: this.caseId,
            ...fields,
          }),
        ),
    });
  }

  /** Ficha 010 §6: responder não tem confirmação com efeito jurídico. */
  answer(inquiryId: string): void {
    if (this.offline()) return;
    void this.facade.answerInquiry(inquiryId, {});
  }

  requestExtend(inquiryId: string): void {
    this.confirm.request({
      action: 'extend',
      confirmKey: CONFIRM_EXTEND_KEY,
      labelKey: CMD_EXTEND_KEY,
      run: () => this.facade.extendInquiry(inquiryId, {}),
    });
  }

  reload(): void {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadInquiries(this.caseId);
  }
}
