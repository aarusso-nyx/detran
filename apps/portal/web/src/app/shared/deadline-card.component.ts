// DeadlineCard (contrato CTG-0003a §5.2; [RN-RAIT-005]; spec §2 invariante 2): mostra o prazo que
// o servidor calculou (`dueOn`), de quem é (`ownedBy`) e, só se o servidor mandar, `daysLeft`
// ([DIVERGE-10], OD-P64). Nenhuma aritmética de datas neste arquivo; a data é formatada pelo
// `StynxIntlDatePipe` do kit.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';

@Component({
  selector: 'portal-deadline-card',
  imports: [StynxTranslatePipe, StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-owned-by]': 'ownedBy()',
    '[attr.data-token]': 'kind()',
  },
  template: `
    <p class="portal-deadline">
      <span class="portal-deadline-label">{{
        labelKey() | stynxTranslate
      }}</span>
      <span class="portal-deadline-owner">{{
        ownerKey() | stynxTranslate
      }}</span>
      <time [attr.datetime]="dueOn()">{{ dueOn() | stynxIntlDate }}</time>
      @if (daysLeft() !== null) {
        <span [attr.data-days-left]="daysLeft()">{{
          'portal.common.deadline.days_left'
            | stynxTranslate: { daysLeft: daysLeft() ?? 0 }
        }}</span>
      }
    </p>
  `,
})
export class DeadlineCardComponent {
  /** ISO calculada no servidor. */
  readonly dueOn = input.required<string>();
  readonly ownedBy = input.required<'citizen' | 'agency'>();
  /** Chave da tela chamadora (ex.: `portal.screens.t11.field.prazo`). */
  readonly labelKey = input.required<string>();
  /** Só se o servidor mandar; nunca calculado. */
  readonly daysLeft = input<number | null>(null);
  /** Token do prazo → `data-token`. */
  readonly kind = input<string | null>(null);

  ownerKey(): string {
    return this.ownedBy() === 'citizen'
      ? 'portal.situation.deadline.citizen'
      : 'portal.situation.deadline.agency';
  }
}
