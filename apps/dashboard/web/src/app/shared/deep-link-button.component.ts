// DeepLinkButton (CTG-0002.md §8 item 16; [RN-DASH-101]): o console leva sempre ao app de
// origem. Destino relativo ao próprio console (ou ausente) não vira link: o botão não renderiza
// e o host recebe `data-invalid`. Nunca dispara comando.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import type { OriginApp } from './models';

@Component({
  selector: 'dash-deep-link-button',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-app]': 'app()',
    '[attr.data-invalid]': 'valid() ? null : "true"',
  },
  template: `@if (valid()) {
    <a [href]="href()" target="_blank" rel="noopener"
      >{{ 'dashboard.common.deep_link' | stynxTranslate
      }}<span class="dash-deep-link-app">{{ app() }}</span></a
    >
  }`,
})
export class DeepLinkButtonComponent {
  /** `null` quando o app de origem ainda não é conhecido (L0): o botão não renderiza. */
  readonly app = input.required<OriginApp | null>();
  readonly href = input.required<string>();

  protected readonly valid = computed(() => {
    const href = this.href();
    if (this.app() === null || href.length === 0) return false;
    if (href.startsWith('/')) return false;
    return !href.includes('/monitoramento');
  });
}
