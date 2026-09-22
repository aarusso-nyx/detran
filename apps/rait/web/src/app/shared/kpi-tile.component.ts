// KpiTile (contrato CTG-0002b §5.19; UC-RAIT-040; IU-RAIT-001 §2 "meta e teto separados"): valor
// (`StynxIntlNumberPipe`; null → '—' + `rait.common.pendingSource`), meta operacional
// (`rait.common.operationalTarget`) e teto legal (`rait.common.legalDeadline`) em elementos
// DISTINTOS (`data-role="target"`/`"ceiling"`), nunca no mesmo elemento nem com a mesma ênfase.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StynxIntlNumberPipe, StynxTranslatePipe } from '@detran/ui';

const OPERATIONAL_TARGET_KEY = 'rait.common.operationalTarget';
const LEGAL_DEADLINE_KEY = 'rait.common.legalDeadline';
const PENDING_SOURCE_KEY = 'rait.common.pendingSource';
const ABSENT_MARK = '—';

@Component({
  selector: 'rait-kpi-tile',
  imports: [StynxTranslatePipe, StynxIntlNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-kpi-tile',
    '[attr.data-value]': 'value()',
    '[attr.data-target]': 'target()',
    '[attr.data-ceiling]': 'ceiling()',
  },
  template: `
    <p class="rait-kpi-tile__label">{{ labelKey() | stynxTranslate }}</p>
    <p class="rait-kpi-tile__value" data-role="value">
      @if (value() !== null) {
        <strong>{{ value() | stynxIntlNumber }}</strong>
        @if (unitKey(); as unit) {
          <span class="rait-kpi-tile__unit">{{ unit | stynxTranslate }}</span>
        }
      } @else {
        <strong>{{ absentMark }}</strong>
        <span class="rait-kpi-tile__pending">{{
          pendingSourceKey | stynxTranslate
        }}</span>
      }
    </p>
    @if (target() !== null) {
      <p class="rait-kpi-tile__target" data-role="target">
        <span>{{ operationalTargetKey | stynxTranslate }}</span>
        <span>{{ target() | stynxIntlNumber }}</span>
      </p>
    }
    @if (ceiling() !== null) {
      <p class="rait-kpi-tile__ceiling" data-role="ceiling">
        <span>{{ legalDeadlineKey | stynxTranslate }}</span>
        <em>{{ ceiling() | stynxIntlNumber }}</em>
      </p>
    }
  `,
})
export class KpiTileComponent {
  readonly labelKey = input.required<string>();
  readonly value = input<number | null>(null);
  /** Meta operacional. */
  readonly target = input<number | null>(null);
  /** Teto legal. */
  readonly ceiling = input<number | null>(null);
  readonly unitKey = input<string | null>(null);

  readonly operationalTargetKey = OPERATIONAL_TARGET_KEY;
  readonly legalDeadlineKey = LEGAL_DEADLINE_KEY;
  readonly pendingSourceKey = PENDING_SOURCE_KEY;
  readonly absentMark = ABSENT_MARK;
}
