// SuppressedCell (CTG-0002.md §8 item 12; [RN-DASH-161]): célula suprimida é dita com todas as
// letras — nunca "0", nunca vazio, nunca "—". O limiar vem marcado do backend
// (`DASH.CELL_SUPPRESSED`); o app não recalcula supressão (primária ou secundária).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';

const SUPPRESSED_KEY = 'dashboard.errors.cell_suppressed';
const THRESHOLD_UNDEFINED_KEY = 'dashboard.errors.cell_threshold_undefined';

@Component({
  selector: 'dash-suppressed-cell',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-suppressed': 'true',
    '[attr.aria-describedby]': 'footnoteId()',
  },
  template: `<span>{{ messageKey() | stynxTranslate: params() }}</span>
    @if (threshold() !== null) {
      <code data-threshold>{{ threshold() }}</code>
    }`,
})
export class SuppressedCellComponent {
  readonly threshold = input.required<number | null>();
  readonly footnoteId = input<string | null>(null);

  protected readonly messageKey = computed(() =>
    this.threshold() === null ? THRESHOLD_UNDEFINED_KEY : SUPPRESSED_KEY,
  );

  protected readonly params = computed<Record<string, string>>(() => {
    const threshold = this.threshold();
    const params: Record<string, string> = {};
    if (threshold !== null) params['threshold'] = String(threshold);
    return params;
  });
}
