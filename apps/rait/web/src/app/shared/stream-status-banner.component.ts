// StreamStatusBanner (contrato CTG-0002b §5.24; M10; spec §8; CTG-0002a §6): sem inputs;
// `sse.polling()` → `<stynx-banner tone="warning" role="status">` com
// `rait.states.stream_unavailable` {seconds = POLLING_INTERVAL_MS / 1000}; senão nada. Toda
// página L2 o inclui logo após o `<h1>`; ao ser criado garante o fluxo aberto (`connect()` é
// idempotente e só é chamado quando o serviço está `idle` — a página pode escopar por
// `{ caseId, sessionId }` antes ou depois).
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StynxBannerComponent, StynxTranslatePipe } from '@detran/ui';
import { POLLING_INTERVAL_MS, SseService } from '../core/sse.service';

const STREAM_UNAVAILABLE_KEY = 'rait.states.stream_unavailable';
const MS_PER_SECOND = 1_000;

@Component({
  selector: 'rait-stream-status-banner',
  imports: [StynxTranslatePipe, StynxBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-stream-status-banner',
    '[attr.data-status]': 'sse.status()',
  },
  template: `
    @if (sse.polling()) {
      <div role="status" aria-live="polite">
        <stynx-banner
          tone="warning"
          [message]="streamUnavailableKey | stynxTranslate: { seconds }"
        />
      </div>
    }
  `,
})
export class StreamStatusBannerComponent {
  readonly sse = inject(SseService);
  readonly streamUnavailableKey = STREAM_UNAVAILABLE_KEY;
  readonly seconds = POLLING_INTERVAL_MS / MS_PER_SECOND;

  constructor() {
    if (this.sse.status() === 'idle') this.sse.connect();
  }
}
