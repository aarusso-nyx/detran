// DeadlineChip (contrato CTG-0002b §5.2; IU-RAIT-001 §1-2; spec §10.1; [RN-RAIT-005]): mostra o
// prazo que o servidor calculou (`dueOn`), o rótulo do timer por `tokenKey('timer', …)`, a
// natureza (`legal` | `operacional`) e, só quando o servidor envia, os dias restantes. O chip
// sem `legalBasis` não compila (`input.required`): prazo nunca sozinho. Nenhuma aritmética de
// datas aqui; a data é formatada pelo `StynxIntlDatePipe` do kit. Classe por `kind` com
// variáveis `--detran-*` (nunca cor literal); o rótulo textual garante "nunca só por cor".
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { tokenKey } from '../core/i18n-token-key';
import type { InfractionTimerCode, RaitTimerCode } from '../data/models';
import { LegalBasisTooltipComponent } from './legal-basis-tooltip.component';

export type DeadlineKind = 'legal' | 'operacional';

const LEGAL_KEY = 'rait.common.legalDeadline';
const OPERATIONAL_KEY = 'rait.common.operationalTarget';
const DAYS_REMAINING_KEY = 'rait.common.daysRemaining';

@Component({
  selector: 'rait-deadline-chip',
  imports: [StynxTranslatePipe, StynxIntlDatePipe, LegalBasisTooltipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-deadline-chip',
    '[class.rait-deadline-chip--legal]': 'kind() === "legal"',
    '[class.rait-deadline-chip--operacional]': 'kind() === "operacional"',
    '[attr.data-kind]': 'kind()',
    '[attr.data-timer]': 'timerCode()',
  },
  template: `
    <span class="rait-deadline-chip__timer">{{
      timerKey() | stynxTranslate
    }}</span>
    <span class="rait-deadline-chip__kind">{{
      kindKey() | stynxTranslate
    }}</span>
    <time class="rait-deadline-chip__due" [attr.datetime]="dueOn()">{{
      dueOn() | stynxIntlDate
    }}</time>
    @if (daysRemaining() !== null) {
      <span
        class="rait-deadline-chip__days"
        [attr.data-days-remaining]="daysRemaining()"
        >{{
          daysRemainingKey | stynxTranslate: { count: daysRemaining() ?? 0 }
        }}</span
      >
    }
    <rait-legal-basis-tooltip [legalBasis]="legalBasis()" />
  `,
  styles: `
    :host {
      display: inline-flex;
      gap: 0.5rem;
      align-items: center;
      border-left: 0.25rem solid
        var(--detran-deadline-operational, currentColor);
      padding-inline: 0.5rem;
    }
    :host(.rait-deadline-chip--legal) {
      border-left-color: var(--detran-deadline-legal, currentColor);
    }
  `,
})
export class DeadlineChipComponent {
  readonly timerCode = input.required<RaitTimerCode | InfractionTimerCode>();
  /** ISO calculada no servidor. */
  readonly dueOn = input.required<string>();
  readonly legalBasis = input.required<string>();
  readonly kind = input.required<DeadlineKind>();
  /** Só do servidor (OD-R12-022); nunca calculado. */
  readonly daysRemaining = input<number | null>(null);

  readonly daysRemainingKey = DAYS_REMAINING_KEY;
  readonly timerKey = computed(() => tokenKey('timer', this.timerCode()));
  readonly kindKey = computed(() =>
    this.kind() === 'legal' ? LEGAL_KEY : OPERATIONAL_KEY,
  );
}
