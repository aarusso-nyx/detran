// RaitErrorBanner mínimo (contrato CTG-0002a §8; catálogo §4; a11y §1): apresenta um
// `ClassifiedError` com o `StynxBannerComponent` do kit (nunca reimplementado). `kind` ≠
// `unavailable` → `role="alert"` (assertivo); `unavailable` → `role="status"`. Texto =
// `messageKey | stynxTranslate`; `requestId` visível quando presente (catálogo §1 regra 7);
// `data-kind`/`data-code` para suporte e testes. A apresentação completa é do CTG-0002b.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxBannerComponent, StynxTranslatePipe } from '@detran/ui';
import type { ClassifiedError } from './error-boundary';

const STATUS_KIND = 'unavailable';

@Component({
  selector: 'rait-error-banner',
  imports: [StynxBannerComponent, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'role()',
    '[attr.aria-live]': 'ariaLive()',
    '[attr.data-kind]': 'error().kind',
    '[attr.data-code]': 'error().code ?? null',
  },
  template: `
    <stynx-banner
      [tone]="tone()"
      [message]="error().messageKey | stynxTranslate"
    />
    @if (error().requestId; as requestId) {
      <p class="rait-error-banner__request">
        <code data-request-id>{{ requestId }}</code>
      </p>
    }
  `,
})
export class RaitErrorBannerComponent {
  readonly error = input.required<ClassifiedError>();

  readonly role = computed(() =>
    this.error().kind === STATUS_KIND ? 'status' : 'alert',
  );
  readonly ariaLive = computed(() =>
    this.error().kind === STATUS_KIND ? 'polite' : 'assertive',
  );
  readonly tone = computed(() =>
    this.error().kind === STATUS_KIND ? 'warning' : 'error',
  );
}
