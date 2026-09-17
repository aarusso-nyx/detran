// ProtocolReceipt (contrato CTG-0003a §5.9; [RN-PORTAL-111] 1): o protocolo é sempre visível —
// número (`data-protocol`), data-hora (`StynxIntlDatePipe`), canal (`portal.notifications.origin.portal`)
// e o botão de download do recibo (`PortalClient.downloadReceipt` → `Blob` → `<a download>`).
// `422 SERVICE_UNAVAILABLE` (recibo assinado pendente, OD-P42/OD-P59) troca o botão pela
// mensagem + canal alternativo, mantendo número e data-hora (recibo mantido também em
// `DELEGATION_FAILED`). Nada é simulado (M15).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { PortalErrorBannerComponent } from '../core/error-banner.component';
import { presentError, type ErrorPresentation } from '../core/error-boundary';
import { PortalClient, type RequestSubmitted } from '../data/portal.client';
import {
  CitizenStatusBadgeComponent,
  badgeOf,
} from './citizen-status-badge.component';

@Component({
  selector: 'portal-protocol-receipt',
  imports: [
    StynxTranslatePipe,
    StynxIntlDatePipe,
    PortalErrorBannerComponent,
    CitizenStatusBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-request-id]': 'requestId()' },
  template: `
    <section class="portal-protocol-receipt" [attr.aria-labelledby]="titleId()">
      <h3 [id]="titleId()" tabindex="-1">
        {{ 'portal.common.receipt.number' | stynxTranslate }}
        <strong data-protocol>{{ protocol().number }}</strong>
      </h3>
      <dl>
        @if (protocol().issuedAt; as issuedAt) {
          <dt>{{ 'portal.common.receipt.issued_at' | stynxTranslate }}</dt>
          <dd>
            <time [attr.datetime]="issuedAt">{{
              issuedAt | stynxIntlDate: dateFormat
            }}</time>
          </dd>
        }
        @if (protocol().channel === 'portal') {
          <dt>{{ 'portal.common.receipt.channel' | stynxTranslate }}</dt>
          <dd data-channel="portal">
            {{ 'portal.notifications.origin.portal' | stynxTranslate }}
          </dd>
        }
      </dl>
      @if (badge(); as situation) {
        <portal-citizen-status-badge
          [situation]="situation"
          [token]="state() ?? ''"
        />
      }
      @if (downloadFailed(); as failure) {
        <portal-error-banner [error]="failure" (retry)="download()" />
      } @else {
        <button
          type="button"
          data-download
          [disabled]="downloading()"
          (click)="download()"
        >
          {{ 'portal.common.receipt.download' | stynxTranslate }}
        </button>
      }
    </section>
  `,
})
export class ProtocolReceiptComponent {
  private readonly client = inject(PortalClient);
  private readonly failure = signal<ErrorPresentation | null>(null);

  readonly requestId = input.required<string>();
  /** `number`, `issuedAt`, `channel`, `receiptHash`. */
  readonly protocol = input.required<RequestSubmitted['protocol']>();
  /** Token → `CitizenStatusBadge` via `badgeOf`. */
  readonly state = input<string | null>(null);
  readonly downloadFailed = this.failure.asReadonly();
  readonly downloading = signal(false);
  readonly downloaded = output<void>();

  readonly dateFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  };
  readonly titleId = computed(() => `portal-receipt-${this.requestId()}`);
  readonly badge = computed(() => {
    const state = this.state();
    return state ? badgeOf(state) : null;
  });

  async download(): Promise<void> {
    this.downloading.set(true);
    try {
      const blob = await this.client.downloadReceipt(this.requestId());
      this.failure.set(null);
      this.saveBlob(blob);
      this.downloaded.emit();
    } catch (error: unknown) {
      this.failure.set(presentError(error));
    } finally {
      this.downloading.set(false);
    }
  }

  /** `<a download="recibo-<number>.pdf">` por object URL, revogado depois do clique. */
  private saveBlob(blob: Blob): void {
    if (typeof URL.createObjectURL !== 'function') return;
    const url = URL.createObjectURL(blob);
    try {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `recibo-${this.protocol().number ?? this.requestId()}.pdf`;
      anchor.rel = 'noopener';
      anchor.hidden = true;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
