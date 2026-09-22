// DutyCycleStepper (CTG-0002.md §8 item 9): os seis estágios da trilha principal de
// [WF-DASH-002] mais os dois desvios (ATRASADO, NAO_CUMPRIDO), cada um com rótulo textual —
// nunca só posição. A evidência anexada aparece por transição. Não decide a próxima transição
// válida: o pré-estado é do servidor (`DASH.DUTY_STATE_INVALID`).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { tokenKey } from '../core/i18n-token-key';
import {
  DUTY_STATES,
  type DutyCycleView,
  type DutyEvidence,
  type DutyState,
} from './models';

const NO_DEADLINE_KEY = 'dashboard.common.fixed.no_deadline_defined';
const PROTOCOL_KEY = 'dashboard.forms.avancar_ciclo.protocol';
const CAPTURE_KEY = 'dashboard.forms.avancar_ciclo.capture_uri';
const HASH_KEY = 'dashboard.forms.avancar_ciclo.hash';
const LATE_BRANCH: readonly DutyState[] = ['ATRASADO', 'NAO_CUMPRIDO'];
const DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };

interface CycleStep {
  readonly state: DutyState;
  readonly labelKey: string;
  readonly current: boolean;
  readonly branch: string | null;
  readonly at: string | null;
  readonly evidence: DutyEvidence | null;
}

@Component({
  selector: 'dash-duty-cycle-stepper',
  imports: [StynxTranslatePipe, StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol>
      @for (step of steps(); track step.state) {
        <li
          [attr.data-state]="step.state"
          [attr.data-branch]="step.branch"
          [attr.aria-current]="step.current ? 'step' : null"
        >
          <span>{{ step.labelKey | stynxTranslate }}</span>
          @if (step.at; as at) {
            <time [attr.datetime]="at">{{
              at | stynxIntlDate: DATE_FORMAT
            }}</time>
          }
          @if (step.evidence?.protocol; as protocol) {
            <span>{{ PROTOCOL_KEY | stynxTranslate }}</span>
            <code data-field="protocol">{{ protocol }}</code>
          }
          @if (step.evidence?.captureUri; as captureUri) {
            <span>{{ CAPTURE_KEY | stynxTranslate }}</span>
            <a [href]="captureUri" rel="noopener">{{ captureUri }}</a>
          }
          @if (step.evidence?.hash; as hash) {
            <span>{{ HASH_KEY | stynxTranslate }}</span>
            <code data-field="hash">{{ hash }}</code>
          }
        </li>
      }
    </ol>
    @if (cycle().deadlineAt; as deadlineAt) {
      <p>
        <time [attr.datetime]="deadlineAt">{{
          deadlineAt | stynxIntlDate: DATE_FORMAT
        }}</time>
      </p>
    } @else {
      <p data-field="deadline">{{ NO_DEADLINE_KEY | stynxTranslate }}</p>
    }
  `,
})
export class DutyCycleStepperComponent {
  readonly cycle = input.required<DutyCycleView>();

  protected readonly NO_DEADLINE_KEY = NO_DEADLINE_KEY;
  protected readonly PROTOCOL_KEY = PROTOCOL_KEY;
  protected readonly CAPTURE_KEY = CAPTURE_KEY;
  protected readonly HASH_KEY = HASH_KEY;
  protected readonly DATE_FORMAT = DATE_FORMAT;

  protected readonly steps = computed<readonly CycleStep[]>(() => {
    const cycle = this.cycle();
    return DUTY_STATES.map((state) => {
      const transition = cycle.transitions.find((item) => item.state === state);
      return {
        state,
        labelKey: tokenKey('duty_states', state),
        current: cycle.state === state,
        branch: LATE_BRANCH.includes(state) ? 'late' : null,
        at: transition?.at ?? null,
        evidence: transition?.evidence ?? null,
      };
    });
  });
}
