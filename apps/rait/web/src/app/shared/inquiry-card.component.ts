// InquiryCard (contrato CTG-0002b §5.9; [RN-RAIT-004]; ficha 010): destinatário
// (`'rait.common.addressee_' + token`), assunto, `requested_at` (data), prazo por
// `<rait-deadline-chip kind="operacional">` quando a página passa o `RaitDeadline` T-DIL, senão
// `due_on` (data) + `tokenKey('timer', 'T-DIL')`; `extension_count` → `rait.common.extensions`
// {count}; `outcome` → `'rait.common.inquiry_' + outcome`. Botões responder/prorrogar sob a chave
// de política de `RAIT_COMMAND_RULES` (`inf:rait-case:answer-inquiry` / `inf:rait-case:extend-inquiry`
// — a notação M8 do §3.5 é `rait-case:answer`/`extend`; divergência OD-R12-026, a verdade em
// runtime é a política); prorrogar desabilitado quando `extension_count ≥ 1` ([RN-RAIT-105],
// forma — o servidor decide). Emite `answer`/`extend` com o `inquiryId`.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { tokenKey } from '../core/i18n-token-key';
import type { RaitDeadline, RaitInquiry } from '../data/models';
import { DeadlineChipComponent } from './deadline-chip.component';

const ADDRESSEE_KEY_PREFIX = 'rait.common.addressee_';
const EXTENSIONS_KEY = 'rait.common.extensions';
const OUTCOME_KEY_PREFIX = 'rait.common.inquiry_';
const ANSWER_KEY = 'rait.action.answer-inquiry';
const EXTEND_KEY = 'rait.action.extend-inquiry';
/** Chaves reais de `RAIT_COMMAND_RULES` (policy.ts; OD-R12-026). */
const ANSWER_PERMISSION = 'inf:rait-case:answer-inquiry';
const EXTEND_PERMISSION = 'inf:rait-case:extend-inquiry';
const INQUIRY_TIMER_CODE = 'T-DIL';
/** [RN-RAIT-105] "prorrogação única" (forma; o servidor decide). */
const MAX_EXTENSIONS = 1;

@Component({
  selector: 'rait-inquiry-card',
  imports: [
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DeadlineChipComponent,
    StynxHasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-inquiry-card',
    '[attr.data-inquiry-id]': 'inquiry().id',
    '[attr.data-token]': 'inquiry().outcome ?? null',
  },
  template: `
    <article>
      <p class="rait-inquiry-card__addressee">
        {{ addresseeKeyPrefix + inquiry().addressee | stynxTranslate }}
      </p>
      <p class="rait-inquiry-card__subject">{{ inquiry().subject }}</p>
      <time [attr.datetime]="inquiry().requested_at">{{
        inquiry().requested_at | stynxIntlDate
      }}</time>
      @if (deadline(); as deadline) {
        <rait-deadline-chip
          [timerCode]="deadline.timer_code"
          [dueOn]="deadline.due_on"
          [legalBasis]="deadline.legal_basis"
          kind="operacional"
        />
      } @else {
        <span class="rait-inquiry-card__due">
          <span>{{ timerKey | stynxTranslate }}</span>
          <time [attr.datetime]="inquiry().due_on">{{
            inquiry().due_on | stynxIntlDate
          }}</time>
        </span>
      }
      <span class="rait-inquiry-card__extensions">{{
        extensionsKey | stynxTranslate: { count: inquiry().extension_count }
      }}</span>
      @if (inquiry().outcome; as outcome) {
        <span class="rait-inquiry-card__outcome">{{
          outcomeKeyPrefix + outcome | stynxTranslate
        }}</span>
      }
      <div class="rait-inquiry-card__actions">
        <button
          *stynxHasPermission="answerPermission"
          type="button"
          data-action="answer"
          [disabled]="disabled()"
          (click)="answer.emit(inquiry().id)"
        >
          {{ answerKey | stynxTranslate }}
        </button>
        <button
          *stynxHasPermission="extendPermission"
          type="button"
          data-action="extend"
          [disabled]="disabled() || extendExhausted()"
          (click)="extend.emit(inquiry().id)"
        >
          {{ extendKey | stynxTranslate }}
        </button>
      </div>
    </article>
  `,
})
export class InquiryCardComponent {
  readonly inquiry = input.required<RaitInquiry>();
  /** T-DIL do caso, quando a página o tem. */
  readonly deadline = input<RaitDeadline | null>(null);
  readonly disabled = input(false);
  readonly answer = output<string>();
  readonly extend = output<string>();

  readonly addresseeKeyPrefix = ADDRESSEE_KEY_PREFIX;
  readonly extensionsKey = EXTENSIONS_KEY;
  readonly outcomeKeyPrefix = OUTCOME_KEY_PREFIX;
  readonly answerKey = ANSWER_KEY;
  readonly extendKey = EXTEND_KEY;
  readonly answerPermission = ANSWER_PERMISSION;
  readonly extendPermission = EXTEND_PERMISSION;
  readonly timerKey = tokenKey('timer', INQUIRY_TIMER_CODE);

  readonly extendExhausted = computed(
    () => this.inquiry().extension_count >= MAX_EXTENSIONS,
  );
}
