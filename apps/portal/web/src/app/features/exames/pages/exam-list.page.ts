// T-20 Meu resultado de exame de aptidão (contrato CTG-0003c §6; ficha IU-PORTAL-T20;
// [RN-PEC-105]; [UC-PORTAL-014]; [JRN-PORTAL-008]): cada exame mostra o rótulo legal TAL COMO o
// servidor manda (`legalLabel`, também em `data-token`), a explicação cidadã SÓ quando o catálogo
// tem `portal.screens.t20.result.<legalLabel>` (nunca inventada), a validade como data, e — só
// quando o servidor envia `boardDueOn` — o prazo (`DeadlineCard`) e o link para requerer a junta.
// "Entrevista devolutiva" não tem comando ([DIVERGE-16]) → `aria-disabled` + indisponível nesta
// versão. `EXAM_PROCESSING` é informativo (`role="status"`) com a data esperada do servidor.
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
import { RouterLink } from '@angular/router';
import {
  DetranEmptyStateComponent,
  DetranLoadingStateComponent,
  StynxI18nService,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
import { ExamesFacade } from '../exames.facade';

const SERVICE_KEY = 'consulta_exame';
const CHARTER_ROUTE = '/carta-servicos';
const EXAM_ROUTE_PREFIX = '/exames/';
const BOARD_ROUTE_SUFFIX = '/junta/nova';
const RESULT_KEY_PREFIX = `portal.screens.t20.result.`;
const EXAM_PROCESSING_CODE = 'PORTAL.EXAM_PROCESSING';

const STATE_KEYS = {
  loading: 'portal.screens.t20.state.carregando',
  empty: 'portal.screens.t20.state.vazio',
  recoverable: 'portal.screens.t20.state.erro_recuperavel',
  unavailable: 'portal.screens.t20.state.indisponivel',
} as const;

@Component({
  selector: 'portal-exam-list-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    DeadlineCardComponent,
  ],
  providers: [ExamesFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-20',
    '[attr.data-status]': 'facade.status()',
    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t20.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t20.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.status() === 'loading') {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (processing(); as processing) {
        <p data-processing>
          {{ stateKeys.recoverable | stynxTranslate }}
          @if (processing.expectedBy; as expectedBy) {
            <time [attr.datetime]="expectedBy">{{
              expectedBy | stynxIntlDate
            }}</time>
          }
        </p>
      }
      @if (facade.status() === 'unavailable') {
        <p data-state-text>{{ stateKeys.unavailable | stynxTranslate }}</p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (!processing() && facade.error(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (facade.status() === 'empty') {
      <detran-empty-state
        [title]="stateKeys.empty | stynxTranslate"
        [message]="stateKeys.empty | stynxTranslate"
      />
      <p>
        <a [routerLink]="charterRoute" [attr.routerLink]="charterRoute">{{
          'portal.common.link.carta' | stynxTranslate
        }}</a>
      </p>
    }

    @if (facade.items().length > 0) {
      <ol data-exam-list class="portal-exam-list" aria-live="polite">
        @for (exam of facade.items(); track exam.examId) {
          <li
            [attr.data-exam-id]="exam.examId"
            [attr.data-token]="exam.legalLabel"
          >
            <p data-legal-label>{{ exam.legalLabel }}</p>
            @if (resultKey(exam.legalLabel); as key) {
              <p data-result-explanation>{{ key | stynxTranslate }}</p>
            }
            @if (exam.validUntil; as validUntil) {
              <p data-valid-until>
                <span>{{
                  'portal.screens.t20.field.validade' | stynxTranslate
                }}</span>
                <time [attr.datetime]="validUntil">{{
                  validUntil | stynxIntlDate
                }}</time>
              </p>
            }
            @if (exam.boardDueOn; as boardDueOn) {
              <portal-deadline-card
                [dueOn]="boardDueOn"
                ownedBy="citizen"
                kind="junta"
                labelKey="portal.screens.t20.field.prazo_junta"
              />
              <a
                [routerLink]="boardRoute(exam.examId)"
                [attr.routerLink]="boardRoute(exam.examId)"
                data-board-request
                >{{
                  'portal.screens.t20.cmd.requerer_junta' | stynxTranslate
                }}</a
              >
            }
            <button
              type="button"
              data-interview
              aria-disabled="true"
              [attr.title]="
                'portal.states.unavailable_in_version' | stynxTranslate
              "
            >
              {{ 'portal.screens.t20.cmd.entrevista' | stynxTranslate }}
            </button>
            <span data-interview-unavailable>
              {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
            </span>
          </li>
        }
      </ol>
    }

    <portal-alternative-channel-note [serviceKey]="serviceKey" />
  `,
})
export class ExamListPageComponent {
  readonly facade = inject(ExamesFacade);
  private readonly i18n = inject(StynxI18nService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly stateKeys = STATE_KEYS;
  readonly serviceKey = SERVICE_KEY;
  readonly charterRoute = CHARTER_ROUTE;

  /** `EXAM_PROCESSING { expectedBy }` (info): estado, não erro. */
  readonly processing = computed<{ readonly expectedBy: string | null } | null>(
    () => {
      const error = this.facade.error();
      if (error?.code !== EXAM_PROCESSING_CODE) return null;
      const expectedBy = error.context['expectedBy'];
      return { expectedBy: typeof expectedBy === 'string' ? expectedBy : null };
    },
  );

  constructor() {
    void this.facade.loadList();
    afterRenderEffect(() => {
      const status = this.facade.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  /** Explicação SÓ se o catálogo tiver a chave para este rótulo legal — nunca mapeado nem inventado. */
  resultKey(legalLabel: string): string | null {
    const key = `${RESULT_KEY_PREFIX}${legalLabel}`;
    return key in this.i18n.catalog() ? key : null;
  }

  boardRoute(examId: string): string {
    return `${EXAM_ROUTE_PREFIX}${examId}${BOARD_ROUTE_SUFFIX}`;
  }

  reload(): void {
    void this.facade.loadList();
  }
}
