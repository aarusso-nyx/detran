// ClocksPanel (contrato CTG-0002b §5.4; spec §5.2 "quatro relógios A/B/C/D"; fichas 007/013):
// quatro posições FIXAS na ordem A, B, C, D (conjunto fechado do contrato `RaitClock['clock_code']`
// — não é ordenação de fila); posição sem relógio → `rait.common.clockAbsent`; com relógio →
// `<rait-risk-flag>` + `started_on`/`ceiling_on` (datas do servidor) + `legal_basis` (tooltip).
// Dias restantes só do input `daysRemaining` (por `clock.id`, vindos do servidor); nada calculado.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  DetranEmptyStateComponent,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import {
  RAIT_CLOCK_CODES,
  type RaitClock,
  type RaitClockCode,
} from '../data/models';
import { LegalBasisTooltipComponent } from './legal-basis-tooltip.component';
import { RiskFlagComponent } from './risk-flag.component';

const CLOCK_ABSENT_KEY = 'rait.common.clockAbsent';
const EMPTY_KEY = 'rait.states.empty';

interface ClockPosition {
  readonly code: RaitClockCode;
  readonly clock: RaitClock | null;
}

@Component({
  selector: 'rait-clocks-panel',
  imports: [
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DetranEmptyStateComponent,
    RiskFlagComponent,
    LegalBasisTooltipComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rait-clocks-panel', '[attr.data-count]': 'clocks().length' },
  template: `
    @if (clocks().length === 0) {
      <detran-empty-state
        [title]="emptyKey | stynxTranslate"
        [message]="emptyKey | stynxTranslate"
      />
    } @else {
      <ul class="rait-clocks-panel__positions">
        @for (position of positions(); track position.code) {
          <li
            class="rait-clocks-panel__position"
            [attr.data-clock-code]="position.code"
            [attr.data-token]="position.clock?.flag ?? null"
          >
            <span class="rait-clocks-panel__code" aria-hidden="true">{{
              position.code
            }}</span>
            @if (position.clock; as clock) {
              <rait-risk-flag
                [flag]="clock.flag"
                [clockCode]="clock.clock_code"
                [daysRemaining]="daysRemaining()[clock.id] ?? null"
                [ceilingOn]="clock.ceiling_on"
              />
              <time [attr.datetime]="clock.started_on">{{
                clock.started_on | stynxIntlDate
              }}</time>
              <time [attr.datetime]="clock.ceiling_on">{{
                clock.ceiling_on | stynxIntlDate
              }}</time>
              <rait-legal-basis-tooltip [legalBasis]="clock.legal_basis" />
            } @else {
              <span class="rait-clocks-panel__absent">{{
                clockAbsentKey | stynxTranslate: { code: position.code }
              }}</span>
            }
          </li>
        }
      </ul>
    }
  `,
})
export class ClocksPanelComponent {
  readonly clocks = input.required<readonly RaitClock[]>();
  /** Por `clock.id`, só do servidor (OD-R12-022). */
  readonly daysRemaining = input<Readonly<Record<string, number>>>({});

  readonly emptyKey = EMPTY_KEY;
  readonly clockAbsentKey = CLOCK_ABSENT_KEY;

  /** Posições fixas A, B, C, D; a primeira ocorrência de cada código na ordem recebida. */
  readonly positions = computed<readonly ClockPosition[]>(() => {
    const clocks = this.clocks();
    return RAIT_CLOCK_CODES.map((code) => ({
      code,
      clock: clocks.find((clock) => clock.clock_code === code) ?? null,
    }));
  });
}
