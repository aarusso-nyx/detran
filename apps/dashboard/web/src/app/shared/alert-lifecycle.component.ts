// AlertLifecycle (CTG-0002.md §8 item 4; §2 invariante 5): os dez estados de [WF-DASH-001] na
// ordem canônica; o que não aconteceu aparece como lacuna, nunca inventado. Reconhecimento
// manual é marcado como manual (registro manual de ciência).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { tokenKey } from '../core/i18n-token-key';
import {
  ALERT_STATES,
  type AlertLifecycleView,
  type AlertState,
} from './models';

const MANUAL_KEY = 'dashboard.common.manual';
const MANUAL_TITLE_KEY = 'dashboard.common.fixed.manual_acknowledgement';
const EXTINCTION_STATES: readonly AlertState[] = [
  'CRITICO_EXTINCAO',
  'INCIDENTE_REGISTRADO',
];
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

interface LifecycleStep {
  readonly state: AlertState;
  readonly labelKey: string;
  readonly current: boolean;
  readonly reached: boolean;
  readonly at: string | null;
  readonly recipient: string | null;
  readonly manual: boolean;
  readonly track: string | null;
}

@Component({
  selector: 'dash-alert-lifecycle',
  imports: [StynxTranslatePipe, StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-track]': 'trackAttr()' },
  template: `
    <ol>
      @for (step of steps(); track step.state) {
        <li
          [attr.data-state]="step.state"
          [attr.data-reached]="step.reached ? 'true' : null"
          [attr.data-track]="step.track"
          [attr.aria-current]="step.current ? 'step' : null"
          [attr.title]="
            step.manual ? (MANUAL_TITLE_KEY | stynxTranslate) : null
          "
        >
          <span>{{ step.labelKey | stynxTranslate }}</span>
          @if (step.at; as at) {
            <time [attr.datetime]="at">{{
              at | stynxIntlDate: DATE_FORMAT
            }}</time>
          }
          @if (step.recipient; as recipient) {
            <span data-field="recipient">{{ recipient }}</span>
          }
          @if (step.manual) {
            <span data-field="manual">{{ MANUAL_KEY | stynxTranslate }}</span>
          }
        </li>
      }
    </ol>
  `,
})
export class AlertLifecycleComponent {
  readonly lifecycle = input.required<AlertLifecycleView>();

  protected readonly MANUAL_KEY = MANUAL_KEY;
  protected readonly MANUAL_TITLE_KEY = MANUAL_TITLE_KEY;
  protected readonly DATE_FORMAT = DATE_FORMAT;

  protected readonly trackAttr = computed(() =>
    this.lifecycle().track === 'extincao' ? 'extincao' : null,
  );

  protected readonly steps = computed<readonly LifecycleStep[]>(() => {
    const lifecycle = this.lifecycle();
    return ALERT_STATES.map((state) => {
      const transition = lifecycle.transitions.find(
        (item) => item.state === state,
      );
      return {
        state,
        labelKey: tokenKey('alert_states', state),
        current: lifecycle.current === state,
        reached: transition !== undefined,
        at: transition?.at ?? null,
        recipient: transition?.recipient ?? null,
        manual: transition?.manual === true,
        track: EXTINCTION_STATES.includes(state) ? 'extincao' : null,
      };
    });
  });
}
