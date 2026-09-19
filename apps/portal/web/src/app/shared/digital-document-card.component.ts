// DigitalDocumentCard (contrato CTG-0003c §5.3; [RN-PORTAL-115]; [RN-PORTAL-117]; [UC-PORTAL-011]):
// cartão da CNH-e/CRLV-e. Categoria `'A'` (documento) EXIGE `qrVerification` — sem QR o cartão
// renderiza como `'C'` (consulta informativa): nunca rotula documento um artefato sem verificação
// (verificação d de RN-117). `'A'`: QR verificável, aviso "não é cópia", disponibilidade offline
// e os botões baixar/compartilhar/imprimir (só emitem; `navigator.share`/`window.print` são da
// página). `'C'`: "consulta informativa", "consultado em" e a fonte — sem botões. A validade é a
// data do servidor em `<time>` (nunca uma duração); campos extras em `<dl>` com `data-token`.
// Bateria crítica / autenticação local: nenhuma API (OD-P54, `source_pending`).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import type { OfflineDocumentKind } from '../core/offline-document.store';

export type DigitalDocumentKind = OfflineDocumentKind; // 'cnh-e' | 'crlv-e'
/** RN-PORTAL-117 (B não passa por aqui). */
export type DocumentCategory = 'A' | 'C';

export interface DigitalDocumentField {
  readonly labelKey: string;
  readonly value: string | null;
  readonly token?: string;
}

const TITLE_KEY: Readonly<Record<DigitalDocumentKind, string>> = {
  'cnh-e': 'portal.documents.cnh.title',
  'crlv-e': 'portal.documents.crlv.title',
};

const DOCUMENT_KEY_PREFIX: Readonly<Record<DigitalDocumentKind, string>> = {
  'cnh-e': `portal.documents.cnh.`,
  'crlv-e': `portal.documents.crlv.`,
};

/** Só `data:`/`http(s)` viram `<img>`; qualquer outro formato é texto (formato `source_pending`). */
const IMAGE_SOURCE = /^(data:image\/|https?:\/\/)/i;

@Component({
  selector: 'portal-digital-document-card',
  imports: [StynxTranslatePipe, StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-kind]': 'kind()',
    '[attr.data-category]': 'effectiveCategory()',
    '[attr.data-offline]': 'offline() ? "true" : "false"',
  },
  template: `
    <article class="portal-document-card" [attr.aria-labelledby]="titleId()">
      <h2 [id]="titleId()">{{ titleKey() | stynxTranslate }}</h2>

      @if (isDocument()) {
        <p data-qr-verifiable>
          {{ documentKey('qrVerifiable') | stynxTranslate }}
        </p>
        @if (qrImage(); as src) {
          <img
            data-qr
            [src]="src"
            [alt]="documentKey('qrVerifiable') | stynxTranslate"
          />
        } @else if (qrVerification(); as qr) {
          <p data-qr class="portal-document-qr-text">{{ qr }}</p>
        }
        @if (offline()) {
          <p role="status" data-offline-available>
            {{ documentKey('offlineAvailable') | stynxTranslate }}
          </p>
        }
      } @else {
        <p data-not-document>
          {{ 'portal.documents.consulta.notDocument' | stynxTranslate }}
        </p>
        @if (cachedAt(); as cachedAt) {
          <p data-consulted-at>
            {{
              'portal.documents.consulta.consultedAt'
                | stynxTranslate
                  : { consultedAt: (cachedAt | stynxIntlDate: dateTimeFormat) }
            }}
          </p>
        }
        @if (source(); as source) {
          <p data-source>
            {{
              'portal.documents.consulta.source' | stynxTranslate: { source }
            }}
          </p>
        }
      }

      @if (validUntil(); as validUntil) {
        <p data-valid-until>
          <time [attr.datetime]="validUntil">{{
            'portal.documents.cnh.validity'
              | stynxTranslate: { validUntil: (validUntil | stynxIntlDate) }
          }}</time>
        </p>
      }

      @if (fields().length > 0) {
        <dl class="portal-document-fields">
          @for (field of fields(); track field.labelKey) {
            <dt>{{ field.labelKey | stynxTranslate }}</dt>
            <dd [attr.data-token]="field.token ?? null">
              {{ field.value ?? '' }}
            </dd>
          }
        </dl>
      }

      @if (isDocument()) {
        <p data-not-copy>{{ documentKey('notCopy') | stynxTranslate }}</p>
        <div class="portal-document-actions" role="group">
          <button
            type="button"
            class="portal-document-action"
            data-download
            [attr.data-has-bytes]="documentBytes() !== null ? 'true' : 'false'"
            (click)="download.emit()"
          >
            {{ downloadLabelKey() | stynxTranslate }}
          </button>
          <button
            type="button"
            class="portal-document-action"
            data-share
            (click)="share.emit()"
          >
            {{ 'portal.common.action.share' | stynxTranslate }}
          </button>
          <button
            type="button"
            class="portal-document-action"
            data-print
            (click)="print.emit()"
          >
            {{ 'portal.common.action.print' | stynxTranslate }}
          </button>
        </div>
      }
    </article>
  `,
})
export class DigitalDocumentCardComponent {
  readonly kind = input.required<DigitalDocumentKind>();
  /** Servidor: `CnhRead.category` ('C' nesta rodada); CRLV emitido → 'A' só com `qrVerification`. */
  readonly category = input.required<DocumentCategory>();
  readonly fields = input<readonly DigitalDocumentField[]>([]);
  /** Data do servidor; nunca duração. */
  readonly validUntil = input<string | null>(null);
  /** Conteúdo do QR (formato `source_pending`); `null` → sem QR. */
  readonly qrVerification = input<string | null>(null);
  /** Blob ou base64 (OD-P91) já em mãos; `null` → a página busca ao clicar em "baixar" (T-16). */
  readonly documentBytes = input<Blob | string | null>(null);
  /** Categoria C: "Consultado em". */
  readonly cachedAt = input<string | null>(null);
  /** Categoria C: "Fonte: {source}" (texto do servidor; ausente → não renderiza). */
  readonly source = input<string | null>(null);
  /** Veio do `OfflineDocumentStore`. */
  readonly offline = input(false);
  readonly downloadLabelKey = input<string>('portal.common.action.download');
  readonly download = output<void>();
  readonly share = output<void>();
  readonly print = output<void>();

  readonly dateTimeFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  };

  /** `'A'` sem `qrVerification` renderiza como `'C'` (§5.3 b). */
  readonly effectiveCategory = computed<DocumentCategory>(() =>
    this.category() === 'A' && this.qrVerification() !== null ? 'A' : 'C',
  );
  readonly isDocument = computed(() => this.effectiveCategory() === 'A');
  readonly titleKey = computed(() => TITLE_KEY[this.kind()]);
  readonly titleId = computed(
    () => `portal-document-card-${this.kind()}-title`,
  );
  readonly qrImage = computed<string | null>(() => {
    const qr = this.qrVerification();
    return qr !== null && IMAGE_SOURCE.test(qr) ? qr : null;
  });

  documentKey(suffix: 'qrVerifiable' | 'offlineAvailable' | 'notCopy'): string {
    return `${DOCUMENT_KEY_PREFIX[this.kind()]}${suffix}`;
  }
}
