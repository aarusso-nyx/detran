// ClockGovernorBadge (CTG-0002.md §8 item 5): a letra do relógio governante está sempre visível
// ([IU-DASH-001] §C.1). O rótulo só aparece quando a chave existe: a semente tem B e C — A e D
// ficam sem rótulo até OD-D16-007 (tabela estática, nunca composição).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import type { ClockCode } from './models';

/** Tabela estática (OD-D16-007): só os relógios com chave na semente. */
const CLOCK_LABEL_KEYS: Readonly<Partial<Record<ClockCode, string>>> = {
  B: 'dashboard.clocks.b',
  C: 'dashboard.clocks.c',
};

@Component({
  selector: 'dash-clock-governor-badge',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-clock]': 'clock()' },
  template: `{{ clock() }}
    @if (labelKey(); as key) {
      <span class="dash-clock-label">{{ key | stynxTranslate }}</span>
    }`,
})
export class ClockGovernorBadgeComponent {
  readonly clock = input.required<ClockCode>();

  protected readonly labelKey = computed(
    () => CLOCK_LABEL_KEYS[this.clock()] ?? null,
  );
}
