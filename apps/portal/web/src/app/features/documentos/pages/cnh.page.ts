// T-16 Minha CNH digital (contrato CTG-0003c §6; ficha IU-PORTAL-T16; [RN-PORTAL-115/117];
// [UC-PORTAL-011]): `GET documents/cnh` é consulta informativa (categoria C, OD-P35 —
// [DIVERGE-8]) renderizada pelo `DigitalDocumentCard`; a validade é a data do servidor; o QR só
// existe com `qrVerification`. Avisos legais (porte obrigatório; quitação antes de renovar) ANTES
// de qualquer ação. "Baixar" pede o documento assinado — nesta rodada 422 → indisponível com o
// motivo, nunca um PDF simulado (M15). Estados: vazio (404), não válida (422), pendência (422 →
// link /autos, rota do servidor ignorada), indisponível (503 mantém o último dado com a data da
// consulta) e offline (documento do `OfflineDocumentStore` se houver; senão `portal.states.offline`).
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import {
  DetranEmptyStateComponent,
  DetranLoadingStateComponent,
  StynxBannerComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import {
  DigitalDocumentCardComponent,
  type DigitalDocumentField,
  type DocumentCategory,
} from '../../../shared/digital-document-card.component';
import { DocumentosFacade } from '../documentos.facade';

const SERVICE_KEY = 'consulta_cnh';
const CNH_NOT_VALID_CODE = 'PORTAL.CNH_NOT_VALID_FOR_DIGITAL';
const CNH_CLEARANCE_PENDING_CODE = 'PORTAL.CNH_CLEARANCE_PENDING';
const STATUS_KEY_PREFIX = `portal.documents.cnh.status.`;
const DOWNLOAD_FILE_NAME = 'cnh-e.pdf';

const STATE_KEYS = {
  empty: 'portal.screens.t16.empty',
  naoValida: 'portal.screens.t16.state.nao_valida',
  pendencia: 'portal.screens.t16.state.pendencia',
} as const;

@Component({
  selector: 'portal-cnh-page',
  imports: [
    StynxTranslatePipe,
    StynxBannerComponent,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    DigitalDocumentCardComponent,
  ],
  providers: [DocumentosFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-16',
    '[attr.data-status]': 'facade.cnhStatus()',
    '[attr.data-source]': 'facade.cnhSource()',
    '[attr.aria-busy]': 'facade.cnhStatus() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t16.title' | stynxTranslate }}
    </h1>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.cnhStatus() === 'loading') {
        <detran-loading-state
          [label]="'portal.states.loading' | stynxTranslate"
        />
      }
      @if (offlineWithDocument()) {
        <stynx-banner
          tone="info"
          [message]="'portal.states.offline' | stynxTranslate"
        />
      }
      @if (stateTextKey(); as key) {
        <p data-state-text [attr.data-token]="stateToken()">
          {{ key | stynxTranslate }}
        </p>
      }
    </div>

    <ul class="portal-cnh-notices" data-notices>
      <li>{{ 'portal.documents.cnh.porte_obrigatorio' | stynxTranslate }}</li>
      <li>
        {{ 'portal.documents.cnh.quitacao_antes_renovar' | stynxTranslate }}
      </li>
    </ul>

    <p>
      <button
        type="button"
        data-reload
        [disabled]="facade.cnhStatus() === 'loading'"
        (click)="reload()"
      >
        {{ 'portal.common.action.retry' | stynxTranslate }}
      </button>
    </p>

    <div role="alert" class="portal-alert-region">
      @if (!offlineWithDocument() && facade.cnhError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
      @if (facade.cnhDocumentError(); as error) {
        <portal-error-banner [error]="error" (retry)="download()" />
      }
    </div>

    @if (facade.cnhStatus() === 'empty') {
      <detran-empty-state
        [title]="stateKeys.empty | stynxTranslate"
        [message]="stateKeys.empty | stynxTranslate"
      />
    }

    @if (facade.cnh(); as cnh) {
      @if (facade.cnhLicense()?.status; as status) {
        <p data-cnh-status [attr.data-token]="status">
          {{ statusLabelKey(status) | stynxTranslate }}
        </p>
      }
      <portal-digital-document-card
        kind="cnh-e"
        [category]="category()"
        [fields]="fields()"
        [validUntil]="facade.cnhLicense()?.validUntil ?? null"
        [qrVerification]="cnh.qrVerification"
        [documentBytes]="cnh.documentBytes"
        [cachedAt]="cnh.cachedAt"
        [offline]="facade.cnhSource() === 'offline'"
        downloadLabelKey="portal.screens.t16.cmd.baixar"
        (download)="download()"
        (share)="share()"
        (print)="print()"
      />
    }

    <portal-alternative-channel-note [serviceKey]="serviceKey" />
  `,
})
export class CnhPageComponent {
  readonly facade = inject(DocumentosFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;
  private objectUrl: string | null = null;

  readonly stateKeys = STATE_KEYS;
  readonly serviceKey = SERVICE_KEY;

  /** Documento vindo do cache offline: aviso em `role="status"`, nunca banner de erro. */
  readonly offlineWithDocument = computed(
    () => this.facade.cnhSource() === 'offline' && this.facade.cnh() !== null,
  );

  /** `CnhRead.category` do servidor ('C' nesta rodada) — o card rebaixa 'A' sem QR. */
  readonly category = computed<DocumentCategory>(() => {
    const category = this.facade.cnh()?.category as string | undefined;
    return category === 'A' ? 'A' : 'C';
  });

  /** `license` livre (OD-P35): categorias e restrições (o status vai acima do card, com `data-token`). */
  readonly fields = computed<readonly DigitalDocumentField[]>(() => {
    const license = this.facade.cnhLicense();
    if (!license) return [];
    const fields: DigitalDocumentField[] = [];
    if (license.categories.length > 0) {
      fields.push({
        labelKey: 'portal.documents.cnh.categories',
        value: license.categories.join(', '),
      });
    }
    if (license.restrictions.length > 0) {
      fields.push({
        labelKey: 'portal.documents.cnh.restrictions',
        value: license.restrictions.join(', '),
      });
    }
    return fields;
  });

  constructor() {
    void this.facade.loadCnh();
    afterRenderEffect(() => {
      const status = this.facade.cnhStatus();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
    this.destroyRef.onDestroy(() => this.revokeObjectUrl());
  }

  stateTextKey(): string | null {
    const code = this.facade.cnhError()?.code;
    if (code === CNH_NOT_VALID_CODE) return STATE_KEYS.naoValida;
    if (code === CNH_CLEARANCE_PENDING_CODE) return STATE_KEYS.pendencia;
    return null;
  }

  /** `CNH_NOT_VALID_FOR_DIGITAL { status }` → `data-token`. */
  stateToken(): string | null {
    const status = this.facade.cnhError()?.context['status'];
    return typeof status === 'string' ? status : null;
  }

  statusLabelKey(status: string): string {
    return `${STATUS_KEY_PREFIX}${status}`;
  }

  /** `GET …?documentBytes=true` → `<a download>` por object URL; 422 → indisponível (banner). */
  async download(): Promise<void> {
    const blob = await this.facade.downloadCnh();
    if (!blob || typeof URL.createObjectURL !== 'function') return;
    this.revokeObjectUrl();
    this.objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = this.objectUrl;
    anchor.download = DOWNLOAD_FILE_NAME;
    anchor.click();
  }

  /** `navigator.share` quando existir; senão nada (a impressão é opção, nunca requisito). */
  share(): void {
    const share = navigator.share?.bind(navigator);
    if (!share) return;
    void share({ title: DOWNLOAD_FILE_NAME }).catch(() => undefined);
  }

  print(): void {
    window.print();
  }

  reload(): void {
    void this.facade.loadCnh();
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(this.objectUrl);
    }
    this.objectUrl = null;
  }
}
