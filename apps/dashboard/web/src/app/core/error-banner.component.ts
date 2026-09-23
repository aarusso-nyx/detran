// Banner de erro (CTG-0002.md §7): apresenta um `ClassifiedError` já classificado — nunca
// classifica nada. `role="alert"` interrompe o leitor de tela só quando há erro de fato;
// indisponibilidade e "indisponível nesta versão" são `role="status"`. Tokens (`decision`,
// `requestId`) vão em `<code>`, nunca traduzidos.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxBannerComponent, StynxTranslatePipe } from '@detran/ui';
import type { ClassifiedError, ErrorKind } from './error-boundary';

const STATUS_KINDS: readonly ErrorKind[] = [
  'unavailable',
  'source_unavailable',
  'unavailable_in_version',
];

@Component({
  selector: 'dash-error-banner',
  imports: [StynxBannerComponent, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-kind]': 'error().kind',
    '[attr.data-code]': 'error().code',
    '[attr.data-presentation]': 'error().presentation',
    '[attr.data-command]': 'error().command',
  },
  template: `
    <div [attr.role]="role()">
      <stynx-banner
        [tone]="tone()"
        [title]="error().stateKey | stynxTranslate: error().stateParams"
        [message]="messageKey() ? (messageKey()! | stynxTranslate) : ''"
      />
      @if (decision()) {
        <code data-decision>{{ decision() }}</code>
      }
      @if (error().requestId) {
        <code data-request-id>{{ error().requestId }}</code>
      }
    </div>
  `,
})
export class DashErrorBannerComponent {
  readonly error = input.required<ClassifiedError>();

  protected readonly role = computed(() =>
    STATUS_KINDS.includes(this.error().kind) ? 'status' : 'alert',
  );

  protected readonly tone = computed(() =>
    STATUS_KINDS.includes(this.error().kind) ? 'info' : 'error',
  );

  protected readonly messageKey = computed(() => this.error().messageKey);

  protected readonly decision = computed(
    () => this.error().stateParams['decision'] ?? '',
  );
}
