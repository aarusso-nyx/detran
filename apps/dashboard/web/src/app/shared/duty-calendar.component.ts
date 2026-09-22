// DutyCalendar (CTG-0002.md §8 item 8; §2 invariante 9): a tabela-mestra de deveres em dois
// conjuntos nomeados (M4) — os indicadores do bloco B e as demais linhas. Prazo ausente é dito
// ("sem prazo definido") em lista separada, nunca omitido; sanção aparece com marca visível.
// Nada é calculado aqui: datas-limite, atraso e virada de período vêm do backend.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { tokenKey } from '../core/i18n-token-key';
import { ClassificationBadgeComponent } from './classification-badge.component';
import { FreshnessSealComponent } from './freshness-seal.component';
import type { DutyView } from './models';

const BLOCK_B_KEY = 'dashboard.blocks.b';
const MASTER_TABLE_KEY = 'dashboard.screens.deveres.title';
const NO_DEADLINE_KEY = 'dashboard.common.fixed.no_deadline_defined';
const LIVE_REGION_KEY = 'dashboard.a11y.live_region';
const DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };

interface DutyList {
  readonly key: string;
  readonly duties: readonly DutyView[];
}

interface DutyGroup {
  readonly key: string;
  readonly labelKey: string;
  readonly lists: readonly DutyList[];
}

@Component({
  selector: 'dash-duty-calendar',
  imports: [
    ClassificationBadgeComponent,
    FreshnessSealComponent,
    StynxTranslatePipe,
    StynxIntlDatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="status"
      aria-live="polite"
      [attr.aria-label]="LIVE_REGION_KEY | stynxTranslate"
    >
      @for (entry of countsByState(); track entry.state) {
        <span [attr.data-state-count]="entry.state"
          >{{ entry.labelKey | stynxTranslate }} {{ entry.count }}</span
        >
      }
    </div>
    @for (group of groups(); track group.key) {
      <section [attr.data-group]="group.key">
        <h2>{{ group.labelKey | stynxTranslate }}</h2>
        @for (list of group.lists; track list.key) {
          <ul [attr.data-deadline]="list.key">
            @for (duty of list.duties; track duty.id) {
              <li>
                <button
                  type="button"
                  [attr.data-sanctioned]="duty.sanctioned ? 'true' : 'false'"
                  [attr.data-own]="duty.own ? 'true' : 'false'"
                  (click)="select.emit(duty)"
                >
                  <span data-field="name">{{
                    duty.indicatorCode
                      ? (indicatorKey(duty.indicatorCode) | stynxTranslate)
                      : duty.label
                  }}</span>
                  <span data-field="state">{{
                    stateKey(duty.cycleState) | stynxTranslate
                  }}</span>
                  @if (duty.deadlineAt; as deadlineAt) {
                    <time [attr.datetime]="deadlineAt">{{
                      deadlineAt | stynxIntlDate: DATE_FORMAT
                    }}</time>
                  } @else {
                    <span data-field="deadline">{{
                      NO_DEADLINE_KEY | stynxTranslate
                    }}</span>
                  }
                  <dash-classification-badge
                    [classification]="duty.classification"
                  />
                  <dash-freshness-seal [freshness]="duty.freshness" block="B">
                    <span data-field="period">{{ duty.period }}</span>
                  </dash-freshness-seal>
                </button>
              </li>
            }
          </ul>
        }
      </section>
    }
  `,
})
export class DutyCalendarComponent {
  readonly duties = input.required<readonly DutyView[]>();
  // O nome do output é fixado pelo contrato (CTG-0002.md §8) e usado pelos specs do
  // Inspector; a regra do angular-eslint desaconselha nomes de evento nativo.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly select = output<DutyView>();

  protected readonly LIVE_REGION_KEY = LIVE_REGION_KEY;
  protected readonly NO_DEADLINE_KEY = NO_DEADLINE_KEY;
  protected readonly DATE_FORMAT = DATE_FORMAT;

  protected readonly groups = computed<readonly DutyGroup[]>(() => {
    const duties = this.duties();
    const indicators = duties.filter((duty) => duty.indicatorCode !== null);
    const others = duties.filter((duty) => duty.indicatorCode === null);
    const groups: DutyGroup[] = [];
    if (indicators.length > 0) {
      groups.push({
        key: 'block_b',
        labelKey: BLOCK_B_KEY,
        lists: listsOf(indicators),
      });
    }
    if (others.length > 0) {
      groups.push({
        key: 'master_table',
        labelKey: MASTER_TABLE_KEY,
        lists: listsOf(others),
      });
    }
    return groups;
  });

  protected readonly countsByState = computed(() => {
    const counts = new Map<string, number>();
    for (const duty of this.duties()) {
      counts.set(duty.cycleState, (counts.get(duty.cycleState) ?? 0) + 1);
    }
    return [...counts.entries()].map(([state, count]) => ({
      state,
      labelKey: tokenKey('duty_states', state),
      count,
    }));
  });

  protected indicatorKey(code: string): string {
    return tokenKey('indicators', code);
  }

  protected stateKey(state: string): string {
    return tokenKey('duty_states', state);
  }
}

/** Com prazo e sem prazo em listas separadas, dentro do mesmo grupo (D-08 §4). */
function listsOf(duties: readonly DutyView[]): readonly DutyList[] {
  const withDeadline = duties.filter((duty) => duty.deadlineAt !== null);
  const withoutDeadline = duties.filter((duty) => duty.deadlineAt === null);
  const lists: DutyList[] = [];
  if (withDeadline.length > 0) {
    lists.push({ key: 'scheduled', duties: withDeadline });
  }
  if (withoutDeadline.length > 0) {
    lists.push({ key: 'none', duties: withoutDeadline });
  }
  return lists;
}
