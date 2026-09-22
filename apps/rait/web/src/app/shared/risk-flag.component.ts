// RiskFlag (contrato CTG-0002b §5.3; spec §5.2/§10.2; IU-RAIT-001 §4; [RN-RAIT-005]): a bandeira
// de risco SEMPRE como texto (`tokenKey('riskFlag', flag)`) — nunca só por cor —, com o relógio
// (`rait.common.clock` {code}), os dias restantes só quando o servidor os envia (ex.: SSE
// `clock.flag-changed.daysRemaining`; OD-R12-022) e, senão, a data do teto (`rait.common.ceilingOn`).
// Ícone `aria-hidden`; nenhum `role="img"` sem texto; nenhuma aritmética de datas.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { tokenKey } from '../core/i18n-token-key';
import type { RaitClockCode, RaitRiskFlag } from '../data/models';

const CLOCK_KEY = 'rait.common.clock';
const DAYS_REMAINING_KEY = 'rait.common.daysRemaining';
const CEILING_ON_KEY = 'rait.common.ceilingOn';

@Component({
  selector: 'rait-risk-flag',
  imports: [StynxTranslatePipe, StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-risk-flag',
    '[attr.data-token]': 'flag()',
    '[attr.data-clock]': 'clockCode()',
  },
  template: `
    <span class="rait-risk-flag__body">
      <span class="rait-risk-flag__icon" aria-hidden="true">●</span>
      <span class="rait-risk-flag__label">{{
        flagKey() | stynxTranslate
      }}</span>
      @if (clockCode(); as code) {
        <span class="rait-risk-flag__clock">{{
          clockKey | stynxTranslate: { code }
        }}</span>
      }
      @if (daysRemaining() !== null) {
        <span
          class="rait-risk-flag__days"
          [attr.data-days-remaining]="daysRemaining()"
          >{{
            daysRemainingKey | stynxTranslate: { count: daysRemaining() ?? 0 }
          }}</span
        >
      } @else if (ceilingOn(); as ceiling) {
        <span class="rait-risk-flag__ceiling">{{
          ceilingOnKey | stynxTranslate: { date: (ceiling | stynxIntlDate) }
        }}</span>
      }
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--detran-risk-color, currentColor);
    }
  `,
})
export class RiskFlagComponent {
  readonly flag = input.required<RaitRiskFlag>();
  readonly clockCode = input<RaitClockCode | null>(null);
  /** Só do servidor (OD-R12-022). */
  readonly daysRemaining = input<number | null>(null);
  readonly ceilingOn = input<string | null>(null);

  readonly clockKey = CLOCK_KEY;
  readonly daysRemainingKey = DAYS_REMAINING_KEY;
  readonly ceilingOnKey = CEILING_ON_KEY;
  readonly flagKey = computed(() => tokenKey('riskFlag', this.flag()));
}
