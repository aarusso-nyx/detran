// PageState (contrato CTG-0002b §5.23; guia §2/§3.4; Padrão de app 12; catálogo §4): único
// ponto onde as páginas apresentam o `ReadStatus` de um slot — `loading` →
// `detran-loading-state`; `empty` → `detran-empty-state`; `error`|`offline`|`not_found`|
// `forbidden`|`unavailable` → `<rait-error-banner [error]>` (o núcleo classifica; `role` por
// `kind`) + botão `rait.common.retry` → `retry`; `idle`|`ready` → nada.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  DetranEmptyStateComponent,
  DetranLoadingStateComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import {
  RaitErrorBannerComponent,
  UNKNOWN_ERROR_KEY,
  type ClassifiedError,
} from '../core/error-boundary';
import type { ReadStatus } from '../data/facades/read-store';

const RETRY_KEY = 'rait.common.retry';
const ERROR_STATUSES: ReadonlySet<ReadStatus> = new Set([
  'error',
  'offline',
  'not_found',
  'forbidden',
  'unavailable',
]);
/** Sem `ClassifiedError` para um status de erro: apresentação mínima, nunca texto inventado. */
const FALLBACK_ERROR: ClassifiedError = {
  kind: 'unknown',
  messageKey: UNKNOWN_ERROR_KEY,
  context: {},
};

@Component({
  selector: 'rait-page-state',
  imports: [
    StynxTranslatePipe,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
    RaitErrorBannerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rait-page-state', '[attr.data-status]': 'status()' },
  template: `
    @switch (status()) {
      @case ('loading') {
        <detran-loading-state [label]="loadingLabelKey() | stynxTranslate" />
      }
      @case ('empty') {
        <detran-empty-state
          [title]="emptyLabelKey() | stynxTranslate"
          [message]="emptyLabelKey() | stynxTranslate"
        />
      }
      @default {
        @if (showError()) {
          <rait-error-banner [error]="error() ?? fallbackError" />
          <button type="button" data-retry (click)="retry.emit()">
            {{ retryKey | stynxTranslate }}
          </button>
        }
      }
    }
  `,
})
export class PageStateComponent {
  readonly status = input.required<ReadStatus>();
  readonly error = input<ClassifiedError | null>(null);
  readonly loadingLabelKey = input.required<string>();
  readonly emptyLabelKey = input.required<string>();
  readonly retry = output<void>();

  readonly retryKey = RETRY_KEY;
  readonly fallbackError = FALLBACK_ERROR;
  readonly showError = computed(() => ERROR_STATUSES.has(this.status()));
}
