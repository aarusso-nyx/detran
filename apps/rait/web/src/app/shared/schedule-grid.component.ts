// ScheduleGrid (contrato CTG-0002b §5.18; UC-RAIT-013; WF-RAIT-004 §3; ficha 046 — L0: o
// componente existe e é testado; nenhuma página o usa nesta CTG): `<stynx-table>` com linhas =
// `schedules` (`member_id` ou `memberLabelOf`) e colunas = dias distintos de `slots[].slot_on`
// NA ORDEM RECEBIDA (nenhuma data gerada, nenhuma aritmética); célula =
// `tokenKey('memberStatus', slot.availability)`; `wip_limit` → `rait.common.wipLimit`;
// `absence_reason` → `'rait.common.absence_' + token`. Somente leitura.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { StynxI18nService, StynxTableComponent } from '@detran/ui';
import type { TableColumn } from './table-column';
import { tokenKey } from '../core/i18n-token-key';
import type { RaitSchedule, RaitScheduleSlot } from '../data/models';

const WIP_LIMIT_KEY = 'rait.common.wipLimit';
const ABSENCE_KEY_PREFIX = 'rait.common.absence_';
const MEMBER_COLUMN = 'member';
const DAY_COLUMN_PREFIX = 'day:';

type ScheduleRow = Record<string, string> & { readonly id: string };

@Component({
  selector: 'rait-schedule-grid',
  imports: [StynxTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-schedule-grid',
    '[attr.data-schedule-count]': 'schedules().length',
    '[attr.data-day-count]': 'days().length',
  },
  template: `<stynx-table
    [columns]="columns()"
    [rows]="rows()"
    [rowTrackBy]="trackRow"
  />`,
})
export class ScheduleGridComponent {
  private readonly i18n = inject(StynxI18nService);

  readonly schedules = input.required<readonly RaitSchedule[]>();
  readonly slots = input.required<readonly RaitScheduleSlot[]>();
  readonly memberLabelOf = input<((memberId: string) => string) | null>(null);

  /** Dias distintos de `slots[].slot_on`, na ordem recebida. */
  readonly days = computed(() => [
    ...new Set(this.slots().map((slot) => slot.slot_on)),
  ]);

  readonly columns = computed<TableColumn<ScheduleRow>[]>(() => [
    { key: MEMBER_COLUMN, label: 'member_id' },
    ...this.days().map((day) => ({
      key: `${DAY_COLUMN_PREFIX}${day}`,
      label: day,
    })),
  ]);

  readonly rows = computed<ScheduleRow[]>(() =>
    this.schedules().map((schedule) => {
      const row: Record<string, string> = {
        id: schedule.id,
        [MEMBER_COLUMN]: this.memberText(schedule),
      };
      for (const day of this.days()) {
        row[`${DAY_COLUMN_PREFIX}${day}`] = this.cellText(schedule, day);
      }
      return row as ScheduleRow;
    }),
  );

  readonly trackRow = (row: ScheduleRow): string => row.id;

  private memberText(schedule: RaitSchedule): string {
    const label =
      this.memberLabelOf()?.(schedule.member_id) ?? schedule.member_id;
    const wip =
      schedule.wip_limit !== null && schedule.wip_limit !== undefined
        ? ` ${this.i18n.translate(WIP_LIMIT_KEY, { count: schedule.wip_limit })}`
        : '';
    return `${label}${wip}`;
  }

  private cellText(schedule: RaitSchedule, day: string): string {
    const slot = this.slots().find(
      (candidate) =>
        candidate.schedule_id === schedule.id && candidate.slot_on === day,
    );
    if (!slot) return '';
    const availability = this.i18n.translate(
      tokenKey('memberStatus', slot.availability),
    );
    const absence = slot.absence_reason
      ? ` ${this.i18n.translate(`${ABSENCE_KEY_PREFIX}${slot.absence_reason}`)}`
      : '';
    return `${availability}${absence}`;
  }
}
