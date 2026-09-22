// DossierViewer (contrato CTG-0002b §5.6; spec §5.2; UC-RAIT-001; fichas 009/026/031/058): dois
// grupos (`<section aria-labelledby>`) por `origin` requerente | ofício, na ordem recebida
// ("most recent first" do contrato — nunca reordena); por documento: `kind` (texto do contrato),
// `filename`, `content_hash` em `<code>`, `attached_at` (data), `digitised_from_paper`.
// Visualizador (`<iframe>` pdf | `<img>`) só quando `documentUrlOf(doc)` devolve URL — não há
// endpoint de URL assinada (OD-R12-023) → sem visualizador e sem link vazio. `status` controla
// `loading`/`empty` pelos primitivos do kit; clique numa linha emite `select`.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import {
  DetranEmptyStateComponent,
  DetranLoadingStateComponent,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import type { ReadStatus } from '../data/facades/read-store';
import {
  RAIT_DOCUMENT_ORIGINS,
  type RaitDocument,
  type RaitDocumentOrigin,
} from '../data/models';

const ORIGIN_KEYS: Readonly<Record<RaitDocumentOrigin, string>> = {
  requerente: 'rait.common.originRequester',
  oficio: 'rait.common.originOfficial',
};
const DIGITISED_KEY = 'rait.common.digitised';
const EMPTY_KEY = 'rait.states.empty';
const LOADING_KEY = 'rait.states.loading';
const PDF_SUFFIX = '.pdf';
let nextId = 0;

interface OriginGroup {
  readonly origin: RaitDocumentOrigin;
  readonly labelKey: string;
  readonly headingId: string;
  readonly documents: readonly RaitDocument[];
}

@Component({
  selector: 'rait-dossier-viewer',
  imports: [
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-dossier-viewer',
    '[attr.data-status]': 'status()',
    '[attr.data-count]': 'documents().length',
  },
  template: `
    @if (status() === 'loading') {
      <detran-loading-state [label]="loadingKey | stynxTranslate" />
    } @else if (documents().length === 0) {
      <detran-empty-state
        [title]="emptyKey | stynxTranslate"
        [message]="emptyKey | stynxTranslate"
      />
    } @else {
      @for (group of groups(); track group.origin) {
        <section
          [attr.aria-labelledby]="group.headingId"
          [attr.data-origin]="group.origin"
        >
          <h3 [id]="group.headingId">{{ group.labelKey | stynxTranslate }}</h3>
          <ul class="rait-dossier-viewer__list">
            @for (doc of group.documents; track doc.id) {
              <li [attr.data-document-id]="doc.id">
                <button
                  type="button"
                  data-document-row
                  class="rait-dossier-viewer__row"
                  (click)="select.emit(doc)"
                >
                  <span class="rait-dossier-viewer__kind">{{ doc.kind }}</span>
                  <span class="rait-dossier-viewer__filename">{{
                    doc.filename
                  }}</span>
                  <code class="rait-dossier-viewer__hash">{{
                    doc.content_hash
                  }}</code>
                  <time [attr.datetime]="doc.attached_at">{{
                    doc.attached_at | stynxIntlDate
                  }}</time>
                  @if (doc.digitised_from_paper) {
                    <span class="rait-dossier-viewer__digitised">{{
                      digitisedKey | stynxTranslate
                    }}</span>
                  }
                </button>
                @if (urlOf(doc); as url) {
                  @if (isPdf(doc)) {
                    <iframe
                      [src]="resourceUrl(url)"
                      [title]="doc.filename"
                    ></iframe>
                  } @else {
                    <img [src]="url" [alt]="doc.filename" />
                  }
                }
              </li>
            }
          </ul>
        </section>
      }
    }
  `,
})
export class DossierViewerComponent {
  readonly documents = input.required<readonly RaitDocument[]>();
  /** URL do storage por documento; `null` = sem visualizador (OD-R12-023). */
  readonly documentUrlOf = input<
    ((document: RaitDocument) => string | null) | null
  >(null);
  readonly status = input<ReadStatus>('ready');
  // Nome fixado pelo contrato CTG-0002b §5.6 (`output select`); nenhum controle de texto interno
  // dispara o `select` nativo.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly select = output<RaitDocument>();

  private readonly sanitizer = inject(DomSanitizer);
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly digitisedKey = DIGITISED_KEY;
  private readonly instance = (nextId += 1);

  /** Ordem dos grupos = `RAIT_DOCUMENT_ORIGINS`; documentos na ordem recebida. */
  readonly groups = computed<readonly OriginGroup[]>(() =>
    RAIT_DOCUMENT_ORIGINS.map((origin) => ({
      origin,
      labelKey: ORIGIN_KEYS[origin],
      headingId: `rait-dossier-${this.instance}-${origin}`,
      documents: this.documents().filter((doc) => doc.origin === origin),
    })).filter((group) => group.documents.length > 0),
  );

  urlOf(doc: RaitDocument): string | null {
    return this.documentUrlOf()?.(doc) ?? null;
  }

  /** A URL vem da página (storage do kernel, OD-R12-023) — contexto de recurso do `<iframe>`
   * exige confiança explícita; nenhum conteúdo de usuário entra aqui. */
  resourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  isPdf(doc: RaitDocument): boolean {
    return doc.filename.toLocaleLowerCase().endsWith(PDF_SUFFIX);
  }
}
