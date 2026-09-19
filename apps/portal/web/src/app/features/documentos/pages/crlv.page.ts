// T-17 Meu veículo — CRLV-e (contrato CTG-0003c §6; ficha IU-PORTAL-T17; [RN-PORTAL-116];
// [UC-PORTAL-012]; OD-P04/DT-027): a quitação (`ClearanceStatus`) ANTES da tentativa de emitir;
// `POST crlv-e` responde 422 nesta rodada (documento assinado pendente) → indisponível com motivo
// e canal, nunca simulado (M15); um 2xx (OD-P59 ext.) vira `DigitalDocumentCard` categoria A só
// com `qrVerification` (senão C) e vai ao cache offline com a validade do servidor. Débito ×
// restrição têm mensagens distintas (a `ClearanceStatus` as mostra, sem link de pagamento na
// restrição); multa sob recurso nunca bloqueia. Offline: só o documento do MESMO veículo
// ([DIVERGE-13]); senão `portal.states.offline`. Impressão é opção (botão), nunca requisito.
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  DetranLoadingStateComponent,
  StynxBannerComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import type { ErrorPresentation } from '../../../core/error-boundary';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { ClearanceStatusComponent } from '../../../shared/clearance-status.component';
import {
  DigitalDocumentCardComponent,
  type DocumentCategory,
} from '../../../shared/digital-document-card.component';
import { DocumentosFacade } from '../documentos.facade';

const VEHICLE_PARAM = 'vehicleId';
const SERVICE_KEY = 'emissao_crlv';
const BLOCKED_CODES: ReadonlySet<string> = new Set([
  'PORTAL.CRLV_BLOCKED_BY_DEBT',
  'PORTAL.CRLV_BLOCKED_BY_RESTRICTION',
]);

@Component({
  selector: 'portal-crlv-page',
  imports: [
    StynxTranslatePipe,
    StynxBannerComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    ClearanceStatusComponent,
    DigitalDocumentCardComponent,
  ],
  providers: [DocumentosFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-17',
    '[attr.data-vehicle-id]': 'vehicleId()',
    '[attr.data-status]': 'facade.clearanceStatus()',
    '[attr.data-crlv-status]': 'facade.crlvStatus()',
    '[attr.aria-busy]': 'busy() ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t17.title' | stynxTranslate }}
    </h1>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (busy()) {
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
      @if (facade.crlvStatus() === 'unavailable') {
        <p data-unavailable [attr.data-reason]="unavailableReason()">
          {{ 'portal.states.service_unavailable' | stynxTranslate }}
        </p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (!offlineWithDocument() && facade.clearanceError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
      @if (facade.crlvError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    <portal-clearance-status
      [clearance]="facade.clearance()"
      [blocked]="blocked()"
      [cachedAt]="facade.clearance()?.cachedAt ?? null"
      [canIssue]="facade.clearance()?.canIssue === true"
      [busy]="busy()"
      (issue)="issue()"
    />

    @if (facade.crlv(); as crlv) {
      <portal-digital-document-card
        kind="crlv-e"
        [category]="category()"
        [validUntil]="crlv.validUntil"
        [qrVerification]="crlv.qrVerification"
        [documentBytes]="crlv.documentBytes"
        [cachedAt]="crlv.issuedAt"
        [offline]="facade.crlvSource() === 'offline'"
        (share)="share()"
        (print)="print()"
      />
    }

    <portal-alternative-channel-note [serviceKey]="serviceKey" />
  `,
})
export class CrlvPageComponent {
  readonly facade = inject(DocumentosFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly vehicleId = signal('');
  readonly serviceKey = SERVICE_KEY;

  readonly busy = computed(
    () =>
      this.facade.clearanceStatus() === 'loading' ||
      this.facade.crlvStatus() === 'submitting',
  );

  /** `CRLV_BLOCKED_*` da emissão → contexto da `ClearanceStatus`. */
  readonly blocked = computed<ErrorPresentation | null>(() => {
    const error = this.facade.crlvError();
    return error?.code !== null &&
      error?.code !== undefined &&
      BLOCKED_CODES.has(error.code)
      ? error
      : null;
  });

  /** Documento emitido: categoria A só com `qrVerification` (§5.3 b); senão C. */
  readonly category = computed<DocumentCategory>(() =>
    this.facade.crlv()?.qrVerification ? 'A' : 'C',
  );

  readonly offlineWithDocument = computed(
    () =>
      this.facade.clearanceStatus() === 'offline' &&
      this.facade.crlvSource() === 'offline' &&
      this.facade.crlv() !== null,
  );

  readonly unavailableReason = computed<string | null>(() => {
    const reason = this.facade.crlvError()?.context['unavailableReason'];
    return typeof reason === 'string' ? reason : null;
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const vehicleId = params.get(VEHICLE_PARAM) ?? '';
        this.vehicleId.set(vehicleId);
        this.focused = false;
        void this.facade.loadClearance(vehicleId);
      });
    afterRenderEffect(() => {
      const status = this.facade.clearanceStatus();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && status === 'ready') {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  /** Sem duplo envio: enquanto a emissão corre, o clique é ignorado. */
  issue(): void {
    if (this.facade.crlvStatus() === 'submitting') return;
    void this.facade.issueCrlv(this.vehicleId());
  }

  share(): void {
    const share = navigator.share?.bind(navigator);
    if (!share) return;
    void share({ title: SERVICE_KEY }).catch(() => undefined);
  }

  print(): void {
    window.print();
  }

  reload(): void {
    void this.facade.loadClearance(this.vehicleId());
  }
}
