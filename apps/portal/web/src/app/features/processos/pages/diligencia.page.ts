// T-11 Responder pendência (contrato CTG-0003b §6; ficha IU-PORTAL-T11; [UC-PORTAL-009];
// [RN-PORTAL-106]): o que o órgão pediu (texto do servidor), o prazo VISÍVEL como data
// (`portal.screens.t11.field.prazo`, nunca "N dias"), a resposta em texto + anexos
// (`AttachmentUploader`, checklist vazio; documento do órgão é recusado só por arquivo) e o envio
// (`RespostaDiligenciaSchema` → `respondDiligence`). 2xx → detalhe relido e status na hora;
// `422 SERVICE_UNAVAILABLE` → indisponível com motivo e canal, nunca confirmação simulada (M15);
// `409 DILIGENCE_NOT_OPEN` → "encerrada" + banner (a pendência não some). Diligência ausente →
// vazio + volta ao processo; `expired`/`answered` → encerrada, sem formulário. Prorrogação: só o
// texto do hint (OD-P76). Sem `canDeactivate` neste par (OD-P79).
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  DetranEmptyStateComponent,
  DetranLoadingStateComponent,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import type { DiligenceResponseBody } from '../../../data/portal.client';
import type { Diligence } from '../../../data/portal-read.models';
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_BYTES,
} from '../../../forms/attachments';
import { RespostaDiligenciaSchema } from '../../../forms/resposta-diligencia.schema';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { AttachmentUploaderComponent } from '../../../shared/attachment-uploader.component';
import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
import { ProcessosFacade } from '../processos.facade';

const REQUEST_PARAM = 'requestId';
const DILIGENCE_PARAM = 'diligenceId';
const PROCESS_ROUTE_PREFIX = '/processos/';
const DEADLINE_ID = 'diligence-deadline';
const DILIGENCE_NOT_OPEN_CODE = 'PORTAL.DILIGENCE_NOT_OPEN';
const DILIGENCE_KIND = 'diligencia';

@Component({
  selector: 'portal-diligencia-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    AttachmentUploaderComponent,
    DeadlineCardComponent,
  ],
  providers: [ProcessosFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-11',
    '[attr.data-request-id]': 'requestId()',
    '[attr.data-diligence-id]': 'diligenceId()',
    '[attr.data-status]': 'facade.detailStatus()',
    '[attr.data-command-status]': 'facade.commandStatus()',
    '[attr.aria-busy]': 'busy() ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t11.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t11.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.detailStatus() === 'loading') {
        <detran-loading-state
          [label]="'portal.states.loading' | stynxTranslate"
        />
      }
      @if (unavailableReason(); as reason) {
        <p data-unavailable [attr.data-reason]="reason">
          {{ 'portal.states.service_unavailable' | stynxTranslate }}
        </p>
      }
      @if (closed()) {
        <p data-closed>
          {{ 'portal.screens.t11.state.encerrada' | stynxTranslate }}
        </p>
      }
      @if (answered()) {
        <p #confirmation tabindex="-1" data-answered>
          {{ 'portal.situation.badge.em_analise' | stynxTranslate }}
        </p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (facade.detailError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
      @if (facade.commandError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (missing()) {
      <detran-empty-state
        [title]="'portal.screens.t11.empty' | stynxTranslate"
        [message]="'portal.screens.t11.empty' | stynxTranslate"
      />
    }

    @if (diligence(); as diligence) {
      <section
        class="portal-diligence"
        [attr.data-diligence-status]="diligence.status"
        [attr.data-outcome]="diligence.outcome"
      >
        @if (diligence.requestText; as text) {
          <p data-request-text>{{ text }}</p>
        }
        @if (dueOn(); as dueOn) {
          <p [id]="deadlineId" data-due-on [attr.data-due-on]="dueOn">
            {{
              'portal.screens.t11.field.prazo'
                | stynxTranslate: { dueOn: (dueOn | stynxIntlDate) }
            }}
          </p>
          <portal-deadline-card
            [dueOn]="dueOn"
            [ownedBy]="'citizen'"
            [kind]="diligenceKind"
            labelKey="portal.situation.next_action.citizen"
          />
        }
        @if (diligence.status === 'open' && !answered()) {
          <!-- Sem portalFieldErrors: a diretiva do par 1 remove todo aria-describedby que não
               seja de erro, e o campo precisa apontar ao prazo (T11 §4; ver relatório). -->
          <form class="portal-diligence-form" (submit)="onSubmit($event)">
            <label>
              <span>{{
                'portal.forms.resposta_diligencia.resposta' | stynxTranslate
              }}</span>
              <textarea
                name="text"
                rows="6"
                [attr.aria-describedby]="dueOn() ? deadlineId : null"
                [value]="text()"
                [disabled]="busy()"
                (input)="onTextInput($event)"
              ></textarea>
            </label>
            <fieldset>
              <legend>
                {{ 'portal.forms.resposta_diligencia.anexos' | stynxTranslate }}
              </legend>
              <portal-attachment-uploader
                [requestId]="requestId()"
                [accept]="accept"
                [maxBytes]="maxBytes"
                [checklist]="[]"
                hintKey="portal.forms.resposta_diligencia.hint"
                labelKey="portal.forms.resposta_diligencia.anexos"
                [disabled]="busy()"
                [(attachmentIds)]="attachmentIds"
              />
            </fieldset>
            <button type="submit" data-action="enviar" [disabled]="busy()">
              {{ 'portal.screens.t11.cmd.enviar' | stynxTranslate }}
            </button>
          </form>
        }
      </section>
    }

    <p>
      <a [routerLink]="processRoute()" [attr.routerLink]="processRoute()">{{
        'portal.screens.t07.title' | stynxTranslate
      }}</a>
    </p>
    <portal-alternative-channel-note />
  `,
})
export class DiligenciaPageComponent {
  readonly facade = inject(ProcessosFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly confirmation =
    viewChild<ElementRef<HTMLElement>>('confirmation');
  private focused = false;
  private focusedConfirmation = false;

  readonly requestId = signal('');
  readonly diligenceId = signal('');
  readonly text = signal('');
  readonly attachmentIds = signal<readonly string[]>([]);
  readonly answered = signal(false);
  readonly accept = ATTACHMENT_ACCEPT;
  readonly maxBytes = ATTACHMENT_MAX_BYTES;
  readonly deadlineId = DEADLINE_ID;
  readonly diligenceKind = DILIGENCE_KIND;

  readonly busy = computed(
    () =>
      this.facade.detailStatus() === 'loading' ||
      this.facade.commandStatus() === 'submitting',
  );

  readonly diligence = computed<Diligence | null>(() =>
    this.facade.detail() ? this.facade.diligence(this.diligenceId()) : null,
  );

  /** Detalhe lido e `diligenceId` ausente em `diligences[]` → vazio (T11 §5). */
  readonly missing = computed(
    () => this.facade.detailStatus() === 'ready' && this.diligence() === null,
  );

  /** `expired`/`answered` na leitura, ou `409 DILIGENCE_NOT_OPEN` no envio → encerrada. */
  readonly closed = computed(() => {
    const diligence = this.diligence();
    if (diligence && diligence.status !== 'open') return true;
    return this.facade.commandError()?.code === DILIGENCE_NOT_OPEN_CODE;
  });

  /** Prazo próprio da diligência ou o da `deadlines[] kind 'diligencia'` (associação: OD-P72). */
  readonly dueOn = computed<string | null>(() => {
    const own = this.diligence()?.dueOn ?? null;
    if (own) return own;
    return (
      this.facade
        .detail()
        ?.deadlines?.find((deadline) => deadline.kind === DILIGENCE_KIND)
        ?.dueOn ?? null
    );
  });

  /** `422 SERVICE_UNAVAILABLE { unavailableReason }` (M15): motivo só em `data-reason`. */
  readonly unavailableReason = computed<string | null>(() => {
    if (this.facade.commandStatus() !== 'unavailable') return null;
    const reason = this.facade.commandError()?.context['unavailableReason'];
    return typeof reason === 'string' ? reason : 'unavailable';
  });

  readonly processRoute = computed(
    () => `${PROCESS_ROUTE_PREFIX}${this.requestId()}`,
  );

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const requestId = params.get(REQUEST_PARAM) ?? '';
        this.requestId.set(requestId);
        this.diligenceId.set(params.get(DILIGENCE_PARAM) ?? '');
        this.focused = false;
        void this.facade.loadDetail(requestId);
      });
    afterRenderEffect(() => {
      const status = this.facade.detailStatus();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && status === 'ready') {
          this.focused = true;
          heading?.focus();
        }
      });
    });
    // Foco na confirmação depois do envio ([UC-PORTAL-009] AC-4).
    afterRenderEffect(() => {
      const confirmation = this.confirmation()?.nativeElement;
      untracked(() => {
        if (confirmation && !this.focusedConfirmation) {
          this.focusedConfirmation = true;
          confirmation.focus();
        }
      });
    });
  }

  onTextInput(event: Event): void {
    this.text.set((event.target as HTMLTextAreaElement).value);
  }

  /** `RespostaDiligenciaSchema.safeParse` → `respondDiligence` (respond_diligence:<did>:<fp>). */
  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.busy()) return;
    const parsed = RespostaDiligenciaSchema.safeParse({
      text: this.text(),
      attachmentIds: [...this.attachmentIds()],
    });
    if (!parsed.success) return;
    const body: DiligenceResponseBody = parsed.data;
    const result = await this.facade.respondDiligence(
      this.requestId(),
      this.diligenceId(),
      body,
    );
    if (result) this.answered.set(true);
  }

  reload(): void {
    void this.facade.loadDetail(this.requestId());
  }
}
