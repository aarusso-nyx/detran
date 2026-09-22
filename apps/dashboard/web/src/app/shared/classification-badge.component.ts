// ClassificationBadge (CTG-0002.md §8 item 17; §2 invariante 10): a classificação do dado
// aparece antes de qualquer exibição ou exportação; ausente é marcada como ausente, nunca
// omitida. Não decide a classificação — ela vem do catálogo de indicadores (backend).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { tokenKey } from '../core/i18n-token-key';
import type { Classification } from './models';

const MISSING_KEY = 'dashboard.errors.classification_missing';

@Component({
  selector: 'dash-classification-badge',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span
    class="dash-classification"
    [attr.data-classification]="classification() ?? 'missing'"
    >{{ labelKey() | stynxTranslate }}</span
  >`,
})
export class ClassificationBadgeComponent {
  readonly classification = input.required<Classification | null>();

  protected readonly labelKey = computed(() => {
    const value = this.classification();
    return value === null ? MISSING_KEY : tokenKey('classification', value);
  });
}
