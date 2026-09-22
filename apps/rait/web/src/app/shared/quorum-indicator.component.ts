// QuorumIndicator (contrato CTG-0002b §5.14; [RN-RAIT-142]; fichas 034/035): `rait.common.quorum`
// + `quorum_observed ?? '—'` / `quorum_required` (números do servidor); estado da banca por
// `tokenKey('orgState', bench.state)` — a verdade do quorum é o estado da banca, NENHUMA
// comparação observado ≥ exigido no cliente; presidência presente por predicado de leitura sobre
// `attendance` (`present && (is_chair || is_chair_substitute)`); paridade só quando
// `judging_body === 'cetran'` e `bench.parity_observed` ≠ null.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxIntlNumberPipe, StynxTranslatePipe } from '@detran/ui';
import { tokenKey } from '../core/i18n-token-key';
import type { RaitAttendance, RaitBench, RaitSession } from '../data/models';

const QUORUM_KEY = 'rait.common.quorum';
const CHAIR_PRESENT_KEY = 'rait.common.chairPresent';
const CHAIR_ABSENT_KEY = 'rait.common.chairAbsent';
const PARITY_KEY = 'rait.common.parity';
const PENDING_SOURCE_KEY = 'rait.common.pendingSource';
const PARITY_BODY = 'cetran';
const ABSENT_MARK = '—';

@Component({
  selector: 'rait-quorum-indicator',
  imports: [StynxTranslatePipe, StynxIntlNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-quorum-indicator',
    '[attr.data-token]': 'bench()?.state ?? null',
    '[attr.data-quorum]': 'quorumText()',
  },
  template: `
    <p class="rait-quorum-indicator__quorum">
      <span>{{ quorumKey | stynxTranslate }}</span>
      <span class="rait-quorum-indicator__observed">{{
        session().quorum_observed !== null &&
        session().quorum_observed !== undefined
          ? (session().quorum_observed | stynxIntlNumber)
          : absentMark
      }}</span>
      <span aria-hidden="true">/</span>
      <span class="rait-quorum-indicator__required">{{
        session().quorum_required | stynxIntlNumber
      }}</span>
    </p>
    @if (benchStateKey(); as key) {
      <p
        class="rait-quorum-indicator__bench"
        [attr.data-token]="bench()?.state"
      >
        {{ key | stynxTranslate }}
      </p>
    } @else {
      <p class="rait-quorum-indicator__bench">
        {{ pendingSourceKey | stynxTranslate }}
      </p>
    }
    <p
      class="rait-quorum-indicator__chair"
      [attr.data-chair-present]="chairPresent()"
    >
      {{ (chairPresent() ? chairPresentKey : chairAbsentKey) | stynxTranslate }}
    </p>
    @if (parityObserved() !== null) {
      <p
        class="rait-quorum-indicator__parity"
        [attr.data-parity]="parityObserved()"
      >
        {{ parityKey | stynxTranslate }}
      </p>
    }
  `,
})
export class QuorumIndicatorComponent {
  readonly session = input.required<RaitSession>();
  readonly bench = input<RaitBench | null>(null);
  readonly attendance = input<readonly RaitAttendance[]>([]);

  readonly quorumKey = QUORUM_KEY;
  readonly chairPresentKey = CHAIR_PRESENT_KEY;
  readonly chairAbsentKey = CHAIR_ABSENT_KEY;
  readonly parityKey = PARITY_KEY;
  readonly pendingSourceKey = PENDING_SOURCE_KEY;
  readonly absentMark = ABSENT_MARK;

  readonly quorumText = computed(() => {
    const observed = this.session().quorum_observed;
    const shown =
      observed === null || observed === undefined ? ABSENT_MARK : observed;
    return `${shown}/${this.session().quorum_required}`;
  });
  readonly benchStateKey = computed(() => {
    const state = this.bench()?.state;
    return state === undefined ? null : tokenKey('orgState', state);
  });
  /** Predicado de leitura, não regra de quorum. */
  readonly chairPresent = computed(() =>
    this.attendance().some(
      (entry) => entry.present && (entry.is_chair || entry.is_chair_substitute),
    ),
  );
  readonly parityObserved = computed(() => {
    if (this.session().judging_body !== PARITY_BODY) return null;
    return this.bench()?.parity_observed ?? null;
  });
}
